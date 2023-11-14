import { Parser } from 'csv-parse';
import { ConsumptionResult } from './types/common';

const isSameDay = (date1: Date, date2: Date) =>
  date1.getDate() === date2.getDate();
const isLastHourOfDay = (date: Date) => date.getHours() === 23;
export const toShortDateStr = (date: Date) => date.toISOString().split('T')[0];

/**
 * Calculates average hourly consumption of the previous days for the given hour index.
 *
 * @param items - previous days consumptions list that will be used for estimation
 * @param hourIdx - hour index of the day. Eg. 00:00 - 01:00 -> 0 ... 23:00 - 00:00 -> 23
 *
 * @example
 *
 * const items = [
 *   { date: '2022-01-01', netConsumptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] }
 * ]
 * const hourIdx = 0 for 00:00 - 01:00 ... for 23:00 - 00:00 -> 23
 *
 * @returns - average hourly consumption for the given hourIdx.
 */
const averageHourlyConsumption = (
  items: ConsumptionResult[],
  hourIdx: number
): number => {
  const totalHourlyConsumptions = items.reduce(
    (acc, item) => (acc += item.netConsumptions[hourIdx]),
    0
  );

  return Math.round(totalHourlyConsumptions / items.length);
};

/**
 * Return hourly consumptions of ongoing day. Actual net consumption is used for the passed hours
 * and estimated consumption (from previous days usage) is used for the remaining hours.
 *
 * @param items - previous days consumptions list
 * @param netConsumptions - ongoing day net consumption of the passed hours
 *
 * @returns - full day hourly net consumptions
 */
const estimateHourlyConsumptions = (
  items: ConsumptionResult[],
  netConsumptions: number[]
): number[] => {
  const hourlyConsumptions: number[] = [...netConsumptions];
  for (let i = netConsumptions.length - 1; i < 24; i++) {
    hourlyConsumptions[i] = averageHourlyConsumption(items, i);
  }
  return hourlyConsumptions;
};

/**
 * Return aggregated records by date and net consumption.
 *
 * @param records - csv-parser records stream
 * @returns aggregated records
 * @example
 *
 *  aggregateRecords [
 *   { date: '2022-01-01', netConsumptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] }
 *  ]
 */
export const aggregateRecords = async (
  records: Parser
): Promise<ConsumptionResult[]> => {
  const items: ConsumptionResult[] = [];
  let previousRecord: { timestamp: any; consumption: any } | null = null;
  let netConsumptions: number[] = [];

  for await (const record of records) {
    const timestamp = record[0];
    const { timestamp: previousTimestamp, consumption: previousConsumption } =
      previousRecord || {};
    if (previousRecord !== null) {
      const endOfDay = new Date(timestamp.valueOf());
      endOfDay.setMilliseconds(-1);

      if (isSameDay(timestamp, previousTimestamp)) {
        netConsumptions.push(record[1] - previousConsumption);
      } else if (isLastHourOfDay(endOfDay)) {
        const date = toShortDateStr(previousTimestamp);
        netConsumptions.push(record[1] - previousConsumption);
        items.push({ date, netConsumptions });
        netConsumptions = [];
      }
    }
    previousRecord = { timestamp, consumption: record[1] };
  }

  // populate the remaining consumption records of the ongoing day
  if (previousRecord !== null && netConsumptions.length > 0) {
    const date = toShortDateStr(previousRecord.timestamp);

    // TODO: Consider DST when estimating hourly consumption
    const estimatedConsumptions = estimateHourlyConsumptions(
      items,
      netConsumptions
    );
    items.push({ date, netConsumptions: estimatedConsumptions });
  }

  return items;
};
