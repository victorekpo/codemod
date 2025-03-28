import { getProfile } from 'my-lib';

const myProfile = getProfile();

const fullName = myProfile.profile.fullName;

const username = myProfile.profile.username;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username, fullName);