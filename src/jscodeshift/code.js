import { getContext } from 'context-lib';

const context = getContext();

const { user } = context;

const fullName = user.name;

const username = user.username;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username, fullName);

// Some other logic here...
