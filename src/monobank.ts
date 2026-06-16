import { z } from 'zod';
import { set } from 'date-fns';
import { createZodFetcher } from 'zod-fetch';
import { MonobankApi, Statement } from 'monobank-api';
import * as cliProgress from 'cli-progress';

import { dateRange, delay } from './utils';

const toTimestamp = (strDate: Date) => {
  return parseInt((strDate.getTime() / 1000).toFixed(0));
};

const fetchWithZod = createZodFetcher();

export const MonoBankStatementSchema = z.object({
  id: z.string(),
  time: z.number(),
  description: z.string(),
  mcc: z.number(),
  originalMcc: z.number(),
  amount: z.number(),
  operationAmount: z.number(),
  currencyCode: z.number(),
  commissionRate: z.number(),
  cashbackAmount: z.number(),
  balance: z.number(),
  hold: z.boolean(),
  receiptId: z.string().optional(),
});

export type MonoBankStatement = z.infer<typeof MonoBankStatementSchema>;

const fetchStatements = (
  account: string,
  startDate: string | number,
  endDate: string | number = ''
) => {
  return fetchWithZod(
    z.array(MonoBankStatementSchema),
    `https://api.monobank.ua/personal/statement/${account}/${startDate}/${endDate}`,
    {
      headers: {
        'X-Token': process.env.MONO_TOKEN || '',
      },
    }
  );
};

export const fetchStatementsByToday = (account: string) => {
  const startDate = toTimestamp(
    set(new Date(), { hours: 0, minutes: 0, seconds: 0 })
  );
  const endDate = toTimestamp(
    set(new Date(), { hours: 23, minutes: 59, seconds: 59 })
  );
  return fetchStatements(account, startDate, endDate);
};

// Fetch every statement between two dates. Monobank rate-limits the statement
// endpoint to one request per 60 seconds, so we wait a minute between windows.
export const getAllStatements = async ({
  account,
  from,
  to,
}: {
  account: string;
  from: Date;
  to: Date;
}) => {
  const monobankApi = new MonobankApi(process.env.MONO_TOKEN || '');
  const ranges = dateRange(from, to, 30);
  const result: Statement[] = [];

  const progressBar = new cliProgress.SingleBar(
    {
      format: 'statements [{bar}] {percentage}% | {value}/{total} windows',
    },
    cliProgress.Presets.shades_classic
  );
  progressBar.start(ranges.length, 0);

  for (let index = 0; index < ranges.length; index++) {
    const data = await monobankApi.getStatements({
      account,
      from: ranges[index].from,
      to: ranges[index].to,
    });
    result.push(...data.reverse());
    progressBar.increment();

    if (ranges.length !== 1 && index !== ranges.length - 1) {
      await delay(1000 * 60);
    }
  }

  progressBar.stop();
  return result;
};
