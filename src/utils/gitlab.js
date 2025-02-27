const axios = require('axios');

// GitLab API setup
const GITLAB_API_URL = 'https://gitlab.com/api/v4'; // Change if using self-hosted GitLab
const ACCESS_TOKEN = 'YOUR_ACCESS'; // Replace with your GitLab access token

// Create a merge request via GitLab API
const createMergeRequest = async (projectId, sourceBranch, targetBranch, assigneeId, title) => {
  const url = `${GITLAB_API_URL}/projects/${projectId}/merge_requests`;
  const data = {
    source_branch: sourceBranch,
    target_branch: targetBranch,
    title: title || 'Automated MR for migration changes',
    assignee_id: assigneeId, // Optionally assign a reviewer
    remove_source_branch: true // Optionally remove the source branch after merging
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Private-Token': ACCESS_TOKEN,
      }
    });
    console.log(`Merge Request created successfully: ${response.data.web_url}`);
  } catch (error) {
    console.error('Error creating merge request:', error.response ? error.response.data.message : error.message);
    throw error;
  }
};

module.exports = { createMergeRequest };
