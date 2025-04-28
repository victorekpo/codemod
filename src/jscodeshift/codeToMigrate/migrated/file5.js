import {myProfile} from './index.js';

const {userProfile} = myProfile;

const fullName = userProfile.name;

const username = userProfile.username;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username, fullName);