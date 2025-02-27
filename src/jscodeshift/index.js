const { automateMigrationAndMergeRequest } = require("../utils/automation");

// Your GitLab project ID
const PROJECT_ID = 'your_project_id';
// GitLab user ID for the MR assignee
const ASSIGNEE_ID = 'assignee_user_id';
// Replace with your target branch (e.g., 'main', 'develop')
const TARGET_BRANCH = 'main';

// Branch to create
const SOURCE_BRANCH = 'feature/migration-v2';
// Command to run the migration script
const MIGRATION_SCRIPT_COMMAND = 'npm run migrate';

// Run the automation
(async () => {
  await automateMigrationAndMergeRequest(
    MIGRATION_SCRIPT_COMMAND,
    PROJECT_ID,
    SOURCE_BRANCH,
    TARGET_BRANCH,
    ASSIGNEE_ID
  );
})();
