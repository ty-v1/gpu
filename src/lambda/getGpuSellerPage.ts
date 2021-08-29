import { CloudWatchLogsHandler } from 'aws-lambda';
import { GetObjectCommand, S3Client, } from '@aws-sdk/client-s3';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Random } from 'random-js';
import { QueueName, SellerMasterBucketName } from '@/resources';
import { GetProductLinkJob } from '@/types/Job';
import * as readline from 'readline';
import { GpuSeller } from '@/types/GpuSeller';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';

export const handler: CloudWatchLogsHandler = async () => {
  const s3Client = new S3Client({});

  const stream = (await s3Client.send(new GetObjectCommand({
    Bucket: SellerMasterBucketName,
    Key: 'sellers.csv',
  }))).Body
  const readLineStream = readline.createInterface(stream);

  const sqsClient = new SQSClient({});
  const random = new Random();
  for await (const chunk of readLineStream) {

    const row = chunk.split(',');
    const job: GetProductLinkJob = {
      type: 'GetProductLink',
      seller: row[0] as GpuSeller,
      url: row[1],
    };

    await sqsClient.send(new SendMessageCommand({
      MessageBody: JSON.stringify(job),
      QueueUrl: `https://sqs.ap-northeast-1.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${QueueName}`,
      DelaySeconds: random.integer(1, 900),
    }));
  }
};
