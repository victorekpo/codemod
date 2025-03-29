import { getProfile } from 'my-lib';

const myProfile = getProfile();

const fullName = myProfile.user.name;

const username = myProfile.user.username;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username, fullName);