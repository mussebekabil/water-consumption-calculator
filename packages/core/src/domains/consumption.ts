export * as Consumption from './consumption';

import { parse } from 'csv-parse';
import { ConsumptionRepository } from '../repositories/consumption';
import { ConsumptionResult } from '../types/common';
import { aggregateRecords } from '../utils';

export const list = async (): Promise<ConsumptionResult[]> => {
  const data = await ConsumptionRepository.fetchAll();

  if (!data) return [];
  const records = parse(data, { delimiter: ',', cast: true, castDate: true });

  return aggregateRecords(records);
};

export const get = async (
  reqDate: string
): Promise<ConsumptionResult | undefined> => {
  const data = await list();
  return data.find((record) => record.date === reqDate);
};
