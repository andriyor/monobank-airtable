import * as dotenv from 'dotenv';
dotenv.config();

import { fetchStatementsByToday } from './monobank';
import { budgetBase, generateAirtableRecords } from './airtable';

(async () => {
  const account = process.env.MONO_ACCOUNT || '';
  const monoBankStatements = await fetchStatementsByToday(account);
  const airtableRecords = generateAirtableRecords(monoBankStatements);

  try {
    await budgetBase('2023 Expenses').create(airtableRecords, {
      typecast: true,
    });
  } catch (error) {
    console.log(error);
  }
})();
