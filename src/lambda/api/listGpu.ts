import { APIGatewayProxyHandler } from 'aws-lambda';
import { Chipsets } from '@/types/Chipset';
import { HttpError } from '@/error/HttpError';

export const handler: APIGatewayProxyHandler = async () => {

  try {
    const responseBody = Chipsets.map((e, i) => ({
      id: i,
      chipset: e
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
    };
  } catch (e) {
    console.error(e);

    if (e instanceof HttpError) {
      return {
        statusCode: e.statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: e.message,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'internal server error',
      }),
    };
  }
};
