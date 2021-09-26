import {
  APIGatewayProxyCallback, APIGatewayProxyEventPathParameters,
  APIGatewayProxyHandler,
  APIGatewayProxyHandlerV2,
  CloudWatchLogsHandler
} from 'aws-lambda';
import { GetObjectCommand, S3Client, } from '@aws-sdk/client-s3';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Random } from 'random-js';
import { QueueName, SellerMasterBucketName } from '@/resources';
import { GetProductLinkJob } from '@/types/Job';
import * as readline from 'readline';
import { GpuSeller } from '@/types/GpuSeller';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { GpuRepository } from '@/model/gpu/GpuRepository';
import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda/trigger/api-gateway-proxy';
import { Chipsets } from '@/types/Chipset';
import { HttpError } from '@/error/HttpError';
import { findGpu } from '@/lambda/api/findGpu';

export const handler: APIGatewayProxyHandler = async (event) => {

  try {
    if (event.pathParameters === null) {
      throw new HttpError(404, 'not found');
    }

    const chipset = getChipSet(event.pathParameters);
    const [year, month] = getYearMonth(event.pathParameters);

    const dto = await findGpu(chipset, year, month);

    return {
      statusCode: 200,
      body: JSON.stringify(dto),
    };
  } catch (e) {
    console.error(e);

    if (e instanceof HttpError) {
      return {
        statusCode: e.statusCode,
        body: JSON.stringify({
          message: e.message,
        }),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'internal server error',
      }),
    };
  }
};

const getChipSet = (pathParameters: APIGatewayProxyEventPathParameters) => {
  const chipsetName = pathParameters?.['chipset'];
  const chipset = Chipsets.find((e) => e === chipsetName);

  if (chipset === undefined) {
    throw new HttpError(404, `unknown chipset ${chipsetName}`);
  }

  return chipset;
};

const getYearMonth: (pathParameters: APIGatewayProxyEventPathParameters) => [number, number] = (pathParameters) => {
  const yearMonth = pathParameters?.['yearMonth'];
  if (yearMonth === undefined || !/^\d{6}$/.test(yearMonth)) {
    throw new HttpError(400, 'invalid yearMonth format. It must be in YYYYMM format.');
  }

  const year = Number.parseInt(yearMonth.slice(0, 4), 10);
  const month = Number.parseInt(yearMonth.slice(-2), 10);

  if (month < 1 || 12 < month) {
    throw new HttpError(400, `invalid month ${month}`);
  }

  return [year, month];
};
