const j = require('jscodeshift');

// Utility function for logging
const logReplacement = (oldName, newName, line, objectName) => {
  // Check if location exists
  if (line) {
    console.log(`Replaced "${oldName}" with "${newName}" in object "${objectName}" at line ${line}`);
  } else {
    console.log(`Replaced "${oldName}" with "${newName}" in object "${objectName}" (location unavailable)`);
  }
};

// Reusable function for replacing properties in member expressions
const findAndReplaceProperty = (root, contextMemberExpression, oldProperty, newProperty, objectName) => {
  const oldMemberExpression = { ...contextMemberExpression, property: { name: oldProperty } };

  // 1. Replace the main property (e.g., context.user -> context.profile)
  root
    .find(j.MemberExpression, oldMemberExpression)
    .forEach(path => {
      const line = path.node.loc ? path.node.loc.start.line : null;
      logReplacement(oldProperty, newProperty, line, objectName);
      path.node.property.name = newProperty;
    });

  // 2. Replace nested properties (e.g., context.user.name -> context.profile.name)
  root
    .find(j.MemberExpression, oldMemberExpression)
    .forEach(path => {
      traverseAndReplaceNested(path, oldProperty, newProperty, objectName);
    });

  // 3. Replace destructured variables (e.g., const { user } = getContext())
  root
    .find(j.VariableDeclarator)
    .filter(path => path.node.id.type === 'ObjectPattern')  // Check for destructured imports
    .forEach(path => {
      const userBinding = path.node.id.properties.find(
        prop => prop.key.name === oldProperty
      );
      if (userBinding) {
        userBinding.key.name = newProperty;
        console.log(`Updated destructured variable "${oldProperty}" to "${newProperty}" in object "${objectName}"`);
      }
    });

  // 4. Replace all uses of destructured old property with new property
  root
    .find(j.Identifier, { name: oldProperty })
    .forEach(path => {
      const line = path.node.loc ? path.node.loc.start.line : null;
      console.log(`For destructured property, replaced usage of "${oldProperty}" with "${newProperty}" in object "${objectName}" at line ${line}`);
      path.node.name = newProperty;
    });

  // 5. Handle array usage (e.g., context.user.map -> context.profile.map)
  root
    .find(j.CallExpression, {
      callee: { name: 'map' },
    })
    .forEach(path => {
      const argument = path.node.arguments[0];
      if (argument && argument.body.type === 'MemberExpression') {
        if (argument.body.object.name === oldProperty) {
          argument.body.object.name = newProperty;
          const line = path.node.loc ? path.node.loc.start.line : null;
          console.log(`Replaced "${objectName}.${oldProperty}" with "${objectName}.${newProperty}" in map function at line ${line}`);
        }
      }
    });
};

// Helper function to traverse and replace nested keys in object expressions
function traverseAndReplaceNested(path, oldKey, newKey, objectName) {
  // Recursively check for deeply nested properties
  if (path.node.property.name === oldKey) {
    path.node.property.name = newKey;
  }

  // Check if loc exists before logging or accessing line number
  if (path.node.loc) {
    const line = path.node.loc.start.line;
    console.log(`Replaced "${oldKey}" with "${newKey}" at line ${line}`);
  }

  // Traverse deeper into nested properties
  if (path.node.object && path.node.object.type === 'MemberExpression') {
    traverseAndReplaceNested(path.node.object, oldKey, newKey, objectName);
  }
}

module.exports = function(fileInfo, api) {
  const root = j(fileInfo.source);

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

  if (isContextImportedFromLibrary) {
    console.log('Migration Script: context-lib detected, proceeding with migration...');

    // Apply the migration for user -> profile and name -> fullName
    findAndReplaceProperty(root, contextMemberExpression, 'user', 'profile', 'context');
    findAndReplaceProperty(root, contextMemberExpression, 'name', 'fullName', 'context');
  }

  // Return the modified source code
  return root.toSource();
};



//
// Key Changes:
//   traverseAndReplaceNested:
//
//     It now accepts oldKey and newKey as arguments, so it’s agnostic of any specific property names.
//   This allows us to pass any property name pair when using this function.
// findAndReplaceProperty:
//
//   The main migration function that handles replacing properties in the code. It now takes the root, contextMemberExpression, oldProperty, and newProperty as arguments.
//   This function calls traverseAndReplaceNested to handle nested property replacements, ensuring the migration is applied to deeply nested properties as well.
//   All logic is passed dynamically, so it remains flexible for different migration scenarios.
//   Modular and Reusable:
//
//   This structure makes it easy to apply migrations across different contexts and property names without modifying the helper functions.
//   You just pass the relevant oldProperty and newProperty to the functions.
//   Migration Script:
//
//   The script migrates user to profile and name to fullName in the context of context-lib, but you can reuse the same utility functions for other migrations by simply changing the property names passed to findAndReplaceProperty.
//   Advantages:
// Decoupling: traverseAndReplaceNested and findAndReplaceProperty are completely decoupled from any specific migration, allowing them to be used across different scripts with various property names.
//   Flexibility: You can now use these functions for any migration involving replacing properties, whether they are deeply nested or in destructured imports.
//   Reuse Across Files: Since the property names are passed dynamically, you can reuse the functions in other migration scripts or utility files, enhancing the scalability of your migration strategy.
//   This approach should give you a clean, flexible, and reusable utility for future migrations!
