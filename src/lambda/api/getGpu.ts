import { APIGatewayProxyEventPathParameters, APIGatewayProxyHandler } from 'aws-lambda';
import { Chipsets } from '@/types/Chipset';
import { HttpError } from '@/error/HttpError';

export const handler: APIGatewayProxyHandler = async (event) => {

  try {
    if (event.pathParameters === null) {
      throw new HttpError(404, 'not found');
    }

    const [id, chipset] = getChipSet(event.pathParameters);

    return {
      statusCode: 200,
      body: JSON.stringify({
        id, chipset,
      }),
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
      statusCode: 400,
      body: JSON.stringify({
        message: 'internal server error',
      }),
    };
  }
};

const getChipSet = (pathParameters: APIGatewayProxyEventPathParameters) => {
  const id = Number.parseInt(pathParameters?.['id'] ?? '', 10);
  const chipset = Chipsets[id];

  if (chipset === undefined) {
    throw new HttpError(404, `unknown chipset id ${id}`);
  }

  return [id, chipset];
};
