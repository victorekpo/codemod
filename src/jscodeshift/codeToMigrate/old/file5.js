import {myProfile} from './index.js';

const {user} = myProfile;

const fullName = user.name;

const username = user.username;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username, fullName);