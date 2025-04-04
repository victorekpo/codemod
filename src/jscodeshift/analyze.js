import {ContextAnalyzer, GraphTransformer} from "@victorekpo/codemod-utils";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const analyzer = new ContextAnalyzer();
const projectPath = path.resolve(__dirname, "codeToMigrate/migrated");
await analyzer.analyzeEntrypoints(`${projectPath}/file5.js`);
await analyzer.logGraph();

const graphTransformer = new GraphTransformer(analyzer.convertGraphToGroupedGraph());
console.log("Grouped Graph:", graphTransformer.dependencyGraph);
const transformationConfig = {
  action: "rename",
  actionProps: {
    variableToTarget: "username",
    newName: "user"
  }
};
graphTransformer.setConfig(transformationConfig);
graphTransformer.processDependencyGraph();