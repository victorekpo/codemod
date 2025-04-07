const { myProfile } = require('./index');


const { user } = myProfile;


const fullName = user.name;

const username = user.username;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username, fullName);