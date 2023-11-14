import { APIGatewayProxyResult } from 'aws-lambda';
import { Consumption } from '@water-consumption-calculator/core/domains/consumption';

export async function main(): Promise<APIGatewayProxyResult> {
  const items = await Consumption.list();

  return {
    statusCode: 200,
    body: JSON.stringify({ items }),
  };
}
