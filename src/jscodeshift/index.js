const {
  findAndReplaceProperty,
  readFilesWithExportsAndImports,
  gatherFilesWithContext,
  updateContext
} = require("./utils/utils");

const {relative} = require("node:path");

const found = readFilesWithExportsAndImports();
const importingFromExports = found.importingFromExports.map(file => relative(process.cwd(), file));

module.exports = function (fileInfo, api) {
  const root = api.j(fileInfo.source);
  const j = api.j;

  const currentFileRelativePath = relative(process.cwd(), fileInfo.path);
  const isMatch = importingFromExports.includes(currentFileRelativePath);

  console.log("file", currentFileRelativePath, "matches:", isMatch);

  // Define common variables for context
  const myProfileMemberExpression = {
    object: {name: 'myProfile'}
  };

  // Handle my-lib detection and migration
  const isContextImportedFromLibrary = root
    .find(j.ImportDeclaration)
    .filter(path => path.node.source.value === 'my-lib')
    .some(path => {
      const importSpecifiers = path.node.specifiers;
      return importSpecifiers.some(specifier =>
        specifier.imported &&
        (specifier.imported.name === 'getProfile' || specifier.imported.name === 'myProfile' || specifier.local.name === 'myProfile')
      );
    });

  if (isContextImportedFromLibrary || isMatch) {
    console.log('Migration Script: my-lib detected, proceeding with migration...');

    // Apply the migration for user -> profile and name -> fullName
    findAndReplaceProperty(fileInfo, root, myProfileMemberExpression, 'user', 'profile', 'context');
    findAndReplaceProperty(fileInfo, root, myProfileMemberExpression, 'name', 'fullName', 'context');
  }

  updateContext(fileInfo, root);

  // Return the modified source code
  return root.toSource();
};