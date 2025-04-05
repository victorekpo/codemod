import {GraphTransformer} from "@victorekpo/codemod-utils";
import {analyzer} from "./analyze.js";

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