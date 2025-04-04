import {getProfile} from 'my-lib';

const myProfile = getProfile();

const fullName = myProfile.user.name;

const username = myProfile.user.username;

if (!user) {
  throw new Error('no username found');
}

console.log('User:', user, fullName);