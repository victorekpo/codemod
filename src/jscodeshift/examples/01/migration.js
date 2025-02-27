// This is a jscodeshift migration script that renames a variable from 'oldName' to 'newName'.
module.exports = (fileInfo, api) => {
  console.log("Migrating...", fileInfo);
  const j = api.jscodeshift;
  return j(fileInfo.source)
    .find(j.VariableDeclarator, {
      id: { name: 'oldName' },
    })
    .forEach(path => {
      path.node.id.name = 'newName';
    })
    .toSource();
};