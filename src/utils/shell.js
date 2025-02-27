const { execSync } = require('child_process');

// Utility function to execute shell commands and return the result
const execCommand = (command) => {
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    console.log(`Command executed successfully: ${command}`);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    throw error;
  }
};

module.exports = {
  execCommand
}