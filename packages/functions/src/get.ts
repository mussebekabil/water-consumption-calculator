import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { Consumption } from '@water-consumption-calculator/core/domains/consumption';
import { toShortDateStr } from '@water-consumption-calculator/core/utils';

export async function main(
  _evt: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  const { queryStringParameters: params } = _evt;

  // TODO: validate if proper date string is passed in as param
  const reqDate = new Date(params?.date || '2022-12-16 13:37');
  const item = await Consumption.get(toShortDateStr(reqDate));

  return {
    statusCode: 200,
    body: JSON.stringify(item),
  };
}
