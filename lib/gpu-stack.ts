import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as path from 'path';
import { QueueName, GpuPriceTableName } from '../src/resources';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import { BillingMode } from '@aws-cdk/aws-dynamodb';
import { Schedule } from '@aws-cdk/aws-events/lib/schedule';

const PROJECT_DIR = path.join('..', 'src');


export class GpuStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getGpuSellerPageFunction = this.createFunction('getGpuSellerPage', 'getGpuSellerPage');
    const parsePageFunction = this.createFunction('parsePage', 'parsePage');
    const queue = new sqs.Queue(this, 'GpuQueue', {
      queueName: QueueName,
      visibilityTimeout: cdk.Duration.seconds(300),
      fifo: true,
    });

    queue.grantSendMessages(getGpuSellerPageFunction);
    queue.grantSendMessages(parsePageFunction);
    queue.grantConsumeMessages(parsePageFunction);

    const table = new dynamodb.Table(this, 'GpuPriceTable', {
      partitionKey: {
        name: 'primaryKey', type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sortKey', type: dynamodb.AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: GpuPriceTableName,
    });

    table.grantWriteData(parsePageFunction);

    const event = new events.Rule(this, 'ParseSellerPageEvent', {
      ruleName: 'pars-seller-page-event',
      description: 'Cron Scheduled Event for Lambda',
      schedule: Schedule.cron({
        hour: '8',
        minute: '0',
      }),
    });

    event.addTarget(new targets.LambdaFunction(getGpuSellerPageFunction, {
      retryAttempts: 1,
    }));
  }

  private createFunction(name: string, fileName: string): NodejsFunction {
    return new NodejsFunction(this, name, {
      entry: path.resolve(PROJECT_DIR, fileName),
      retryAttempts: 1,
    });

  }
}
