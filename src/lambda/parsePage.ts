import { SQSHandler } from 'aws-lambda';
import { GetGpuPriceJob, GetProductLinkJob, Job } from '@/types/Job';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Random } from 'random-js';
import { QueueName } from '@/resources';
import { SellerPageParserFactory } from '@/parser/seller/SellerPageParserFactory';
import { GpuPageParserFactory } from '@/parser/gpu/GpuPageParserFactory';
import { fetchContent } from '@/util/fetchContent';
import { GpuRepository } from '@/model/gpu/GpuRepository';

export const handler: SQSHandler = async ({Records}) => {
  const job = JSON.parse(Records[0].body) as Job;

  if (job.type === 'GetProductLink') {
    await getProductLinks(job);
  } else {
    await storeGpuPrice(job);
  }
};

const getProductLinks = async (job: GetProductLinkJob) => {
  const sqsClient = new SQSClient({});
  const random = new Random();
  const productLinksGenerator = new SellerPageParserFactory().create(job.seller)
    .parse(job.url);

  for await (const productLinks of productLinksGenerator) {
    for (const productLink of productLinks) {
      const getGpuPriceJob: GetGpuPriceJob = {
        seller: job.seller,
        url: productLink,
        type: 'GetGpuPrice',
      };
      console.log(`GetGpuPriceJob: ${JSON.stringify(getGpuPriceJob, null, 2)}`);

      await sqsClient.send(new SendMessageCommand({
        MessageBody: JSON.stringify(getGpuPriceJob),
        QueueUrl: `https://sqs.ap-northeast-1.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${QueueName}`,
        DelaySeconds: random.integer(1, 900),
      }));
    }
  }
};

const storeGpuPrice = async (job: GetGpuPriceJob) => {
  const gpu = await new GpuPageParserFactory().create(job.seller)
    .parse(job.url);
  console.log(`Gpu: ${JSON.stringify(gpu, null, 2)}`);

  await new GpuRepository().store(gpu);
};
