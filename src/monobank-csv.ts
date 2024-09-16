import { createWriteStream } from 'node:fs';

import { stringify } from 'csv-stringify';
import { format } from 'date-fns';
import { MonobankApi, Statement } from 'monobank-api';
import * as dotenv from 'dotenv';

dotenv.config();

type StatementsCsv = {
  id: string;
  time: string;
  description: string;
  mcc: number;
  amount: number;
};

const transformStatements = (statements: Statement[]) => {
  return statements
    .filter((row) => row.amount < 0)
    .map((row) => {
      const date = new Date(row.time * 1000);
      return {
        id: row.id,
        time: format(date, 'yyyy-MM-dd'),
        description: row.description,
        mcc: row.mcc,
        amount: Math.round(Math.abs(row.amount) / 100),
      };
    });
};

const writeCsv = (filename: string, statements: StatementsCsv[]) => {
  const writableStream = createWriteStream(filename);

  const columns = ['id', 'time', 'description', 'mcc', 'amount'];

  const stringifier = stringify({ header: true, columns: columns });

  statements.forEach((row) => {
    stringifier.write(row);
  });

  stringifier.pipe(writableStream);
};

(async () => {
  const monobankApi = new MonobankApi(process.env.MONO_TOKEN || '');
  const account = process.env.MONO_ACCOUNT || '';

  const startDate = new Date('2024.9.1');
  const endDate = new Date('2024.9.16');

  const statements = await monobankApi.getAllStatements({
    account,
    from: startDate,
    to: endDate,
  });

  const newStatements = transformStatements(statements);

  const filename = 'example.csv';
  writeCsv(filename, newStatements);
})();
