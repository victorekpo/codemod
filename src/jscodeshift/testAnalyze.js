import {ContextAnalyzer} from "@victorekpo/codemod-utils";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const analyzer = new ContextAnalyzer();
const projectPath = path.resolve(__dirname, "codeToMigrate/migrated");
await analyzer.analyzeEntrypoints(`${projectPath}/file5.js`);
await analyzer.logGraph();
