const fs = require('node:fs');
const path = require('node:path');
const jscodeshift = require('jscodeshift');
const {updateContext} = require('./utils/utils');
const transform = require('./index');

const filePath = './codeToMigrate/migrated/file4.js';
const fileInfo = {
  path: filePath,
  source: fs.readFileSync(filePath, 'utf8')
};

const api = {
  j: jscodeshift
};

const transformedSource = transform(fileInfo, api);

fs.writeFileSync("testFile.js", transformedSource, 'utf8');
console.log(`Transformation applied to ${filePath}`);