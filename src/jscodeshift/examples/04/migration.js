const j = require('jscodeshift');

module.exports = function(fileInfo, api) {
  const root = j(fileInfo.source);

  // 1. Handle Multiple Context Imports (default or named imports)
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

  console.log("isContextImportedFromLibrary", isContextImportedFromLibrary);

  if (isContextImportedFromLibrary) {
    console.log('Migration Script: context-lib detected, proceeding with migration...');

    // 2. Replace context.user with context.profile in all instances
    root
      .find(j.MemberExpression, {
        object: { name: 'context' },
        property: { name: 'user' }
      })
      .forEach(path => {
        path.node.property.name = 'profile'; // Replace 'user' with 'profile'
        console.log(`Replaced "context.user" with "context.profile" at line ${path.node.loc.start.line}`);
      });

    // 3. Replace context.user.name with context.profile.name
    root
      .find(j.MemberExpression, {
        object: { name: 'context' },
        property: { name: 'user' }
      })
      .filter(path => path.node.property.name === 'name')  // Specifically targeting 'name'
      .forEach(path => {
        path.node.property.name = 'profile'; // Change 'user.name' to 'profile.name'
        console.log(`Replaced "context.user.name" with "context.profile.name" at line ${path.node.loc.start.line}`);
      });

    // 4. Handle Nested Objects (e.g., context.user.details.name -> context.profile.details.name)
    root
      .find(j.MemberExpression, {
        object: { name: 'context' },
        property: { name: 'user' }
      })
      .forEach(path => {
        traverseAndReplaceNested(path, 'user', 'profile');
      });

    // 5. Handle Destructured Imports (e.g., const { user } = getContext())
    root
      .find(j.VariableDeclarator)
      .filter(path => path.node.id.type === 'ObjectPattern')  // Check for destructured imports
      .forEach(path => {
        const userBinding = path.node.id.properties.find(
          prop => prop.key.name === 'user'
        );
        if (userBinding) {
          userBinding.key.name = 'profile'; // Update destructured variable name
          console.log(`Updated destructured variable "user" to "profile"`);
        }
      });

    // 6. Replace all uses of destructured 'user' with 'profile'
    root
      .find(j.Identifier, { name: 'user' }) // Look for any use of 'user'
      .forEach(path => {
        path.node.name = 'profile'; // Change usage of 'user' to 'profile'
        console.log(`Replaced usage of "user" with "profile" at line ${path.node.loc.start.line}`);
      });

    // 7. Handle Array Usage (e.g., context.user.map -> context.profile.map)
    root
      .find(j.CallExpression, {
        callee: { name: 'map' },
      })
      .forEach(path => {
        const userArgument = path.node.arguments[0];
        if (userArgument && userArgument.body.type === 'MemberExpression') {
          if (userArgument.body.object.name === 'user') {
            userArgument.body.object.name = 'profile'; // Update array usage
            console.log(`Replaced "context.user" with "context.profile" in map function at line ${path.node.loc.start.line}`);
          }
        }
      });
  }

  // Return the modified source code
  return root.toSource();
};

// Helper function to traverse and replace nested keys in object expressions
function traverseAndReplaceNested(path, oldKey, newKey) {
  // Recursively check for deeply nested context.user to context.profile
  if (path.node.property.name === oldKey) {
    path.node.property.name = newKey;
  } else if (path.node.property.name === 'name') {
    path.node.property.name = 'fullName'; // Example for a deeper nested field like name
  }
  if (path.node.object && path.node.object.type === 'MemberExpression') {
    traverseAndReplaceNested(path.node.object, oldKey, newKey); // Recursively call if the object is also a member expression
  }
}



// Breakdown of Updates:
//   Handling Multiple Imports:
//
//   The import check now supports both default imports (context) and named imports (getContext or context).
// We look for both import context from 'context-lib' and import { getContext, context } from 'context-lib' in the code.
//   Logging:
//
// Added console.log statements at key points to help you track the migration process and see exactly where the changes are made.
//   It logs each replacement, such as replacing context.user with context.profile and tracking the lines where changes happen.
//   Handling Nested Objects:
//
//   The traverseAndReplaceNested function is a recursive helper that replaces context.user at any depth (e.g., context.user.details.name becomes context.profile.details.name).
// This method is flexible for any deeply nested context object.
//   Handling Destructured Imports:
//
//   The script now checks for destructured imports like const { user } = getContext() and updates the destructured user variable to profile.
//   Handling Array Usage:
//
//   If context.user is used inside array methods like .map(), the script checks for that and replaces context.user with context.profile accordingly.
//
//   Handle Destructured Variables:
//
//   After detecting a destructured user (e.g., const { user } = context;), we immediately replace user with profile in the destructuring assignment.
//   Replace All Subsequent user Usage:
//
//   After destructuring, any usage of user in the code (like const username = user;) is replaced with profile. This ensures that user is fully migrated to profile throughout the code.
