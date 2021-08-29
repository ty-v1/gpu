import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as path from 'path';
import { QueueName, GpuPriceTableName, SellerMasterBucketName } from '../src/resources';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as s3 from '@aws-cdk/aws-s3';
import { BillingMode } from '@aws-cdk/aws-dynamodb';
import { Schedule } from '@aws-cdk/aws-events/lib/schedule';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Duration } from '@aws-cdk/core';

const PROJECT_DIR = path.join(__dirname, '..', 'src', 'lambda');


export class GpuStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getGpuSellerPageFunction = this.createFunction('getGpuSellerPage', 'getGpuSellerPage.ts');
    const parsePageFunction = this.createFunction('parsePage', 'parsePage.ts');
    const queue = new sqs.Queue(this, 'GpuQueue', {
      queueName: QueueName,
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    queue.grantSendMessages(getGpuSellerPageFunction);
    queue.grantSendMessages(parsePageFunction);
    queue.grantConsumeMessages(parsePageFunction);

    parsePageFunction.addEventSource(new SqsEventSource(queue));

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

    const bucket = new s3.Bucket(this, 'GpuSellerBucket', {
      bucketName: SellerMasterBucketName,
    });

    bucket.grantRead(getGpuSellerPageFunction);
  }

  private createFunction(name: string, fileName: string): NodejsFunction {
    return new NodejsFunction(this, name, {
      entry: path.resolve(PROJECT_DIR, fileName),
      retryAttempts: 1,
      environment: {
        AWS_ACCOUNT_ID: cdk.Stack.of(this).account,
      }
    });

  }
}
