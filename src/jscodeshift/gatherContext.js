const {gatherFilesWithContext} = require("./utils/utils");
const { resolve } = require("node:path");

const projectDir = resolve(__dirname, '.', 'codeToMigrate', 'migrated');
console.log("Project directory:", projectDir);

const filesWithContext = gatherFilesWithContext(projectDir);
console.log("Files with code context:", filesWithContext);