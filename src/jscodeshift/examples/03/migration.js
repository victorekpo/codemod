const j = require('jscodeshift');

module.exports = function(fileInfo, api) {
  const root = j(fileInfo.source);

  // 1. Ensure 'context' is imported from 'context-lib'
  const isContextImportedFromLibrary = root
    .find(j.ImportDeclaration)
    .filter(path => path.node.source.value === 'context-lib')
    .find(j.ImportSpecifier)
    .some(specifier => specifier.node.imported.name === 'getContext' || specifier.node.imported.name === 'context');

  console.log("isContextImportedFromLibrary", isContextImportedFromLibrary);

  if (isContextImportedFromLibrary) {
    // 2. Find all instances where context.user is used and replace it with context.profile
    root
      .find(j.MemberExpression, {
        object: { name: 'context' },
        property: { name: 'user' }
      })
      .forEach(path => {
        path.node.property.name = 'profile'; // Replace user with profile
      });

    // 3. Find all instances where context.user.name is accessed and replace with context.profile.name
    root
      .find(j.MemberExpression, {
        object: { name: 'context' },
        property: { name: 'user' }
      })
      .filter(path => path.node.property.name === 'name')  // Specifically targeting the 'name' property
      .forEach(path => {
        path.node.property.name = 'profile'; // Change to profile
      });
  }

  // Return the modified source code
  return root.toSource();
};
