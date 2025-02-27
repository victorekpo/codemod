const { execCommand } = require("./shell");

// Commit and push changes to a new branch
const commitAndPushChanges = (sourceBranch) => {
  try {
    console.log('Creating and pushing changes to the new branch...');
    execCommand(`git checkout -b ${sourceBranch}`); // Create a new branch
    execCommand('git add .'); // Stage all changes
    execCommand('git commit -m "Applied migration updates"'); // Commit changes
    execCommand(`git push origin ${sourceBranch}`); // Push changes to GitLab
    console.log('Changes pushed to GitLab.');
  } catch (error) {
    console.error('Error committing or pushing changes.');
    throw error;
  }
};

module.exports = {
  commitAndPushChanges
}