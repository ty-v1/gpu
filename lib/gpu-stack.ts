import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';

export class GpuStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'AQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });
    //
    // const topic = new sns.Topic(this, 'ATopic');
    //
    // topic.addSubscription(new subs.SqsSubscription(queue));
  }
}
