import {myProfile} from './index.js';

const {profile} = myProfile;

const fullName = profile.fullName;

const username = profile.username;

if (!user) {
  throw new Error('no username found');
}

console.log('User:', user, fullName);