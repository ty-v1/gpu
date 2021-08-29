import { CloudWatchLogsHandler } from 'aws-lambda';
import { GetObjectCommand, S3Client, } from '@aws-sdk/client-s3';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Random } from 'random-js';
import { QueueName, SellerMasterBucketName } from '@/resources';
import { GetProductLinkJob } from '@/types/Job';

export const handler: CloudWatchLogsHandler = async () => {
  const s3Client = new S3Client({});

  const stream = (await s3Client.send(new GetObjectCommand({
    Bucket: SellerMasterBucketName,
    Key: 'sellers.csv',
  }))).Body

  const sqsClient = new SQSClient({});
  const random = new Random();
  for await (const chunk of stream) {

    const row = chunk.split(',');
    const job: GetProductLinkJob = {
      type: 'GetProductLink',
      seller: row[0],
      url: row[1],
    };

    await sqsClient.send(new SendMessageCommand({
      MessageBody: JSON.stringify(job),
      QueueUrl: QueueName,
      MessageGroupId: job.seller,
      MessageDeduplicationId: job.url,
      DelaySeconds: random.integer(1, 900),
    }));
  }
};