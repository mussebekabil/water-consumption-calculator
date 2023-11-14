export * as ConsumptionRepository from './consumption';

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({});
export const fetchAll = async (): Promise<string | undefined> => {
  const command = new GetObjectCommand({
    Bucket: 'water-consumption',
    Key: 'sample_data.csv',
  });

  try {
    const response = await client.send(command);
    return await response.Body?.transformToString();
  } catch (err) {
    console.error(err);
  }
};
