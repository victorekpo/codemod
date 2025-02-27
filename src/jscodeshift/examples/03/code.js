// oldCode.js

import { getContext } from 'context-lib';

const context = getContext();

const user = context.user;

const username = context.user.name;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username);

// Some other logic here...
