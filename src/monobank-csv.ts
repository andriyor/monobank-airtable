import * as fs from 'node:fs';
import * as path from 'node:path';

import { stringify } from 'csv-stringify';
import { format } from 'date-fns';
import { MonobankApi, Statement } from 'monobank-api';
import * as dotenv from 'dotenv';
import { typeFlag } from 'type-flag';

dotenv.config();

const parsed = typeFlag({
  start: {
    type: String,
    alias: 's',
  },
  end: {
    type: String,
    alias: 'e',
  },
  file: {
    type: String,
    alias: 'f',
  },
});

const mcc = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'mcc-uk-object.json'), 'utf-8')
);

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
        description: row.description.replace(/\n/g, ' '),
        mcc: row.mcc,
        category: mcc[row.mcc].shortDescription,
        amount: Math.round(Math.abs(row.amount) / 100),
      };
    });
};

const writeCsv = (filename: string, statements: StatementsCsv[]) => {
  const writableStream = fs.createWriteStream(filename);

  const columns = ['id', 'time', 'description', 'mcc', 'category', 'amount'];

  const stringifier = stringify({ header: true, columns: columns });

  statements.forEach((row) => {
    stringifier.write(row);
  });

  stringifier.pipe(writableStream);
};

const args = process.argv.slice(2);

type Account = {
  id: string;
  sendId: string;
  currencyCode: number;
  cashbackType: string;
  balance: number;
  creditLimit: number;
  maskedPan: [];
  type: 'black' | 'eAid' | 'white';
  iban: string;
};

(async () => {
  if (parsed.flags.start && parsed.flags.end && parsed.flags.file) {
    const monobankApi = new MonobankApi(process.env.MONO_TOKEN || '');

    let accountId = process.env.MONO_ACCOUNT || '';

    if (!accountId) {
      const clientInfo = await monobankApi.clientInfo();
      const defaultAccount = clientInfo.accounts.find((account: Account) => {
        return account.type === 'black' && account.currencyCode === 980;
      });
      accountId = defaultAccount.id;
      console.log('accountId', accountId)
    }

    const startDate = new Date(parsed.flags.start);
    const endDate = new Date(parsed.flags.end);

    const statements = await monobankApi.getAllStatements({
      account: accountId,
      from: startDate,
      to: endDate,
    });

    const newStatements = transformStatements(statements);

    writeCsv(parsed.flags.file, newStatements);
  } else {
    console.log(
      'provide start, end date and file anme example: --start 2024.11.23 --end 2024.11.24 --file result.csv'
    );
  }
})();
