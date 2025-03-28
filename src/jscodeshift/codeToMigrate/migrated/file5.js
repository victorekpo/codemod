import { myProfile } from './index';

const { profile } = myProfile;

const fullName = profile.fullName;

const username = profile.username;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username, fullName);