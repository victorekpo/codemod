import { getContext } from 'context-lib';

const context = getContext();

const { profile } = context;

const fullName = profile.fullName;

const username = profile.username;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username, fullName);

// Some other logic here...
