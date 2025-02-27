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
      const line = path.parentPath.node.loc ? path.parentPath.node.loc.start.line : null;
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

module.exports = {
  findAndReplaceProperty
}