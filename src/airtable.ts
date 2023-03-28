import * as fs from 'fs';
import * as path from 'path';

import { format } from 'date-fns';
import * as Airtable from 'airtable';

import { MonoBankStatement } from './monobank';

const mcc = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mcc-uk-object.json'), 'utf-8'));

Airtable.configure({
  apiKey: process.env.AIRTABLE_KEY,
});

export const budgetBase = Airtable.base(process.env.AIRTABLE_BASE || '');

export const generateAirtableRecords = (
  monoBankStatements: MonoBankStatement[]
) => {
  return monoBankStatements.map((record) => {
    const date = new Date(record.time * 1000);
    return {
      fields: {
        Name: record.description,
        'amount actual': Math.round(Math.abs(record.amount) / 100),
        mcc: record.mcc,
        category: mcc[record.mcc].shortDescription,
        'group type': mcc[record.mcc].group.type,
        'group name': mcc[record.mcc].group.description,
        date: format(date, 'yyyy-MM-dd'),
        month: date.getMonth() + 1,
      },
    };
  });
};
