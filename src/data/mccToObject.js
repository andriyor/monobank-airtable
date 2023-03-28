const fs = require('fs')
const path = require('path')

const mccFile = JSON.parse(fs.readFileSync(path.join(__dirname, 'mcc-uk.json'), 'utf-8'))

const optimized = mccFile.reduce((acc, curr) => {
  acc[curr.mcc] = curr
  return acc;
}, {})

fs.writeFileSync(path.join(__dirname, 'mcc-uk-object.json'), JSON.stringify(optimized))
