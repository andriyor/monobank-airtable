# monobank-export

### Config

.env file

```
MONO_TOKEN="******"
MONO_ACCOUNT="******"
AIRTABLE_KEY="******"
AIRTABLE_BASE="******"
```

For mcc used this data [Oleksios/Merchant-Category-Codes: MCC codes dataset in Ukrainian, English and Russian (with groups and without groups)](https://github.com/Oleksios/Merchant-Category-Codes)

## Examples

export to airtable

```sh
tsx src/index.ts
```

export to csv file

```sh
tsx src/monobank-csv.ts
```

## API Doc

[Monobank open API](https://api.monobank.ua/docs/index.html#tag/Kliyentski-personalni-dani/paths/~1personal~1webhook/post)

[API. Особистий кабінет](https://api.monobank.ua/index.html)
