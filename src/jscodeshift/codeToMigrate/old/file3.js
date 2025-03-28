const myProfile = {
  user: {
    name: 'John Doe',
    username: 'johndoe'
  }
}

const fullName = myProfile.user.name;

const username = myProfile.user.username;

if (!username) {
  throw new Error('no username found');
}

console.log('User:', username, fullName);