import { z } from 'zod';
import { set } from 'date-fns';
import { createZodFetcher } from 'zod-fetch';

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
