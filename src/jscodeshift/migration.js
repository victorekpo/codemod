const {findAndReplaceProperty, findAndExtractImports, findAndExtractVariables, findAndExtractExports} = require("../utils/migrationUtils");

const context = {
  imports: new Map(),  // Tracks imported symbols (key: variable name, value: source file)
  exports: new Map(),  // Tracks exported symbols (key: variable name, value: source file)
  aliases: new Map(),   // Tracks variable assignments and re-exports
};


module.exports = function(fileInfo, api) {
  console.log("*** Running migration script ***");
  const root = api.j(fileInfo.source);
  const j = api.j;

  // Define common variables for context
  const contextMemberExpression = {
    object: { name: 'context' }
  };

  // Handle context-lib detection and migration
  const isContextImportedFromLibrary = root
    .find(j.ImportDeclaration)
    .filter(path => path.node.source.value === 'context-lib')
    .some(path => {
      const importSpecifiers = path.node.specifiers;
      return importSpecifiers.some(specifier =>
        specifier.imported &&
        (specifier.imported.name === 'getContext' || specifier.imported.name === 'context' || specifier.local.name === 'context')
      );
    });

  findAndExtractImports(root, context);
  findAndExtractVariables(root, context);
  findAndExtractExports(root, context);

  console.log("Context Imports", context.imports);
  console.log("Context Exports", context.exports);
  console.log("Context Aliases", context.aliases);

  if (isContextImportedFromLibrary) {
    console.log('Migration Script: context-lib detected, proceeding with migration...');

    // Apply the migration for user -> profile and name -> fullName
    findAndReplaceProperty(root, contextMemberExpression, 'user', 'profile', 'context');
    findAndReplaceProperty(root, contextMemberExpression, 'name', 'fullName', 'context');
  }

  // Return the modified source code
  return root.toSource();
};