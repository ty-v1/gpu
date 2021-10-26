import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';
import { Duration } from '@aws-cdk/core';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as path from 'path';
import { GpuPriceTableName, QueueName, SellerMasterBucketName } from '../src/resources';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { BillingMode } from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as s3 from '@aws-cdk/aws-s3';
import { Schedule } from '@aws-cdk/aws-events/lib/schedule';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { FieldLogLevel, GraphqlApi, Schema } from '@aws-cdk/aws-appsync';

const PROJECT_DIR = path.join(__dirname, '..', 'src', 'lambda');


export class GpuStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getGpuSellerPageFunction = this.createFunction('getGpuSellerPage', 'getGpuSellerPage.ts');
    const parsePageFunction = this.createFunction('parsePage', 'parsePage.ts', cdk.Duration.seconds(300));
    const queue = new sqs.Queue(this, 'GpuQueue', {
      queueName: QueueName,
      receiveMessageWaitTime: cdk.Duration.seconds(20),
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

    const restApi = new RestApi(this, 'GpuApi', {
      restApiName: 'gpu-api',
      deployOptions: {
        stageName: 'v1',
      },
    });

    const getGpuPriceFunction = this.createFunction('getGpuPrice', path.join('api', 'getGpuPrice.ts'));
    const listGpuFunction = this.createFunction('listGpu', path.join('api', 'listGpu.ts'));
    const getGpuFunction = this.createFunction('getGpu', path.join('api', 'getGpu.ts'));
    table.grantReadData(getGpuPriceFunction);

    const allGpuResource = restApi.root.addResource('gpu');
    allGpuResource.addMethod('GET', new LambdaIntegration(listGpuFunction));
    allGpuResource.addResource('{id}')
      .addMethod('GET', new LambdaIntegration(getGpuFunction));

    restApi.root.addResource('price')
      .addResource('{id}')
      .addResource('{yearMonth}')
      .addMethod('GET', new LambdaIntegration(getGpuPriceFunction));

    this.createAppSync(table);
  }

  private createFunction(name: string, fileName: string, timeout: cdk.Duration = cdk.Duration.seconds(3)): NodejsFunction {
    return new NodejsFunction(this, name, {
      entry: path.resolve(PROJECT_DIR, fileName),
      retryAttempts: 1,
      timeout,
      environment: {
        AWS_ACCOUNT_ID: cdk.Stack.of(this).account,
      }
    });
  }

  private createAppSync(table: dynamodb.Table) {
    const api = new GraphqlApi(this, 'GpuGraphql', {
      name: 'GpuGraphql',
      schema: Schema.fromAsset(path.join(__dirname, '..', 'schema.graphql')),
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
        excludeVerboseContent: true,
      },
      xrayEnabled: true,
    });

    const allGpuResolver = this.createFunction(
      'allGpuResolver',
      path.join('resolver', 'allGpuResolver.ts'),
      Duration.seconds(30)
    );
    table.grantReadData(allGpuResolver);
    api.addLambdaDataSource('AllGpuDatasource', allGpuResolver)
      .createResolver({
        typeName: 'Query',
        fieldName: 'allGPU',
      });

    const gpuResolver = this.createFunction(
      'gpuResolver',
      path.join('resolver', 'gpuResolver.ts'),
      Duration.seconds(10)
    );
    table.grantReadData(gpuResolver);
    api.addLambdaDataSource('GpuDatasource', gpuResolver)
      .createResolver({
        typeName: 'Query',
        fieldName: 'getGPU',
      });
  }
}
