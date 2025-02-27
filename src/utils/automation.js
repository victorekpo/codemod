const { commitAndPushChanges} = require("../utils/git");
const { createMergeRequest } = require("../utils/gitlab");
const { execCommand } = require("../utils/shell");

// Run the migration script
const runMigrationScript = (scriptCommand) => {
  try {
    console.log('Running migration script...');
    execCommand(scriptCommand);
    console.log('Migration script executed successfully.');
  } catch (error) {
    console.error('Error running migration script.');
    throw error;
  }
};

// Main function to automate the process
const automateMigrationAndMergeRequest = async (
  migrationScriptCommand,
  projectId,
  sourceBranch,
  targetBranch,
  assigneeId
) => {
  try {
    // Step 1: Run the migration script
    runMigrationScript(migrationScriptCommand);

    // Step 2: Commit and push changes to GitLab
    commitAndPushChanges(sourceBranch);

    // Step 3: Create the merge request via GitLab API
    await createMergeRequest(projectId, sourceBranch, targetBranch, assigneeId);

    console.log('Automation completed successfully!');
  } catch (error) {
    console.error('Automation process failed.', error);
  }
};

module.exports = {
  automateMigrationAndMergeRequest
}