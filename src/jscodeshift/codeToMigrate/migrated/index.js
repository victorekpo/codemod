import {getProfile} from 'my-lib';

export const myProfile = getProfile();

const {userProfile} = myProfile;

const fullName = userProfile.name;

const user = userProfile.username;

if (!user) {
  throw new Error('no username found');
}

console.log('User:', user, fullName);