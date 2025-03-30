const j = require('jscodeshift');
const fs = require('fs');
const path = require('path');
const {Identifier, CallExpression} = require("@victorekpo/codemod-utils");

const contextFile = path.join(__dirname, '..', '..', '..', 'context.json');

// Utility function for logging
const logReplacement = (fileInfo, oldName, newName, line, objectName) => {
  // Check if location exists
  if (line) {
    console.log(`Replaced "${oldName}" with "${newName}" in object "${objectName}" at line ${line} in file ${fileInfo.path}`);
  } else {
    console.log(`Replaced "${oldName}" with "${newName}" in object "${objectName}" in file ${fileInfo.path}`);
  }
};

// Reusable function for replacing properties in member expressions
const findAndReplaceProperty = (fileInfo, root, contextMemberExpression, oldProperty, newProperty, objectName) => {
  console.log(`Replacing "${oldProperty}" with "${newProperty}" in object "${objectName}" in file ${fileInfo.path}`);
  const oldMemberExpression = {...contextMemberExpression, property: {name: oldProperty}};

  // 1. Replace the main property (e.g., context.user -> context.profile)
  root
    .find(j.MemberExpression, oldMemberExpression)
    .forEach(path => {
      const line = path.node.loc ? path.node.loc.start.line : null;
      logReplacement(fileInfo, oldProperty, newProperty, line, objectName);
      path.node.property.name = newProperty;
    });

  // 2. Replace nested properties (e.g., context.user.name -> context.profile.name)
  root
    .find(j.MemberExpression, oldMemberExpression)
    .forEach(path => {
      traverseAndReplaceNested(path, oldProperty, newProperty, objectName);
    });

  // 3. Replace destructured variables (e.g., const { user } = getProfile())
  root
    .find(j.VariableDeclarator)
    .filter(path => path.node.id.type === 'ObjectPattern')  // Check for destructured imports
    .forEach(path => {
      const userBinding = path.node.id.properties.find(
        prop => prop.key.name === oldProperty
      );
      if (userBinding) {
        userBinding.key.name = newProperty;
        console.log(`Updated destructured variable "${oldProperty}" to "${newProperty}" in object "${objectName} in file ${fileInfo.path}`);
      }
    });

  // 4. Replace all uses of destructured old property with new property
  root
    .find(j.Identifier, {name: oldProperty})
    .forEach(path => {
      const id = new Identifier(path.node);
      console.log("ID", id.getName());
      const line = path.parentPath.node.loc ? path.parentPath.node.loc.start.line : null;
      console.log(`For destructured property, replaced usage of "${oldProperty}" with "${newProperty}" in object "${objectName}" (line: ${line} in ${fileInfo.path})`);
      path.node.name = newProperty;
    });

  // 5. Handle array usage (e.g., context.user.map -> context.profile.map)
  root
    .find(j.CallExpression, {
      callee: {name: 'map'},
    })
    .forEach(path => {
      const func = new CallExpression(path.node);
      console.log("Func", func.getArguments());
      const argument = path.node.arguments[0];
      if (argument && argument.body.type === 'MemberExpression') {
        if (argument.body.object.name === oldProperty) {
          argument.body.object.name = newProperty;
          const line = path.node.loc ? path.node.loc.start.line : null;
          console.log(`Replaced "${objectName}.${oldProperty}" with "${objectName}.${newProperty}" in map function at line ${line} in file ${fileInfo.path}`);
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
    console.log(`Replaced "${oldKey}" with "${newKey}" at line ${line} in object "${objectName}"`);
  }

  // Traverse deeper into nested properties
  if (path.node.object && path.node.object.type === 'MemberExpression') {
    traverseAndReplaceNested(path.node.object, oldKey, newKey, objectName);
  }
}

// Function to check if getProfile or context is imported from 'my-lib'
const isContextImportedFromLibrary = (root) => {
  return root
    .find(j.ImportDeclaration)
    .filter(path => path.node.source.value === 'my-lib')
    .some(path => {
      const importSpecifiers = path.node.specifiers;
      return importSpecifiers.some(specifier =>
        specifier.imported &&
        (specifier.imported.name === 'getProfile' || specifier.imported.name === 'context' || specifier.local.name === 'context')
      );
    });
};

// Function to check if any variable derived from getProfile is exported
const checkIfContextIsExported = (filePath, root) => {
  const exportedProperties = [];

  // Check for ES6 export { context } or any other variable name
  root
    .find(j.ExportNamedDeclaration)
    .forEach(path => {
      const declaration = path.node.declaration;
      if (declaration && declaration.type === 'VariableDeclaration') {
        declaration.declarations.forEach(declarator => {
          // We check if the initializer is coming from getProfile or its alias
          if (declarator.init && declarator.init.type === 'CallExpression') {
            const callee = declarator.init.callee;
            if (callee.name === 'getProfile' ||
              (callee.type === 'MemberExpression' && callee.object.name === 'my-lib' && callee.property.name === 'getProfile')) {
              exportedProperties.push(declarator.id.name); // Exported variable
            }
          }
        });
      }
    });

  // Check for CommonJS export module.exports = context (or any variable name)
  root
    .find(j.AssignmentExpression)
    .forEach(path => {
      if (path.node.left.type === 'MemberExpression' &&
        path.node.left.object.name === 'module' &&
        path.node.left.property.name === 'exports') {
        // Check if it's assigned from getProfile or its alias
        if (path.node.right.type === 'Identifier' && path.node.right.name === 'getProfile') {
          exportedProperties.push(path.node.right.name); // Exported variable
        } else if (path.node.right.type === 'CallExpression' &&
          path.node.right.callee.name === 'getProfile') {
          exportedProperties.push(path.node.right.callee.name); // Exported variable
        } else if (path.node.right.type === 'ObjectExpression') {
          path.node.right.properties.forEach(prop => {
            if (prop.value.type === 'CallExpression' &&
              (prop.value.callee.name === 'getProfile' ||
                (prop.value.callee.type === 'MemberExpression' &&
                  prop.value.callee.object.name === 'my-lib' &&
                  prop.value.callee.property.name === 'getProfile'))) {
              exportedProperties.push(prop.key.name); // Exported variable
            }
          });
        }
      }
    });

  return exportedProperties.length > 0;
};

// Function to check if context (or any variable) is imported from 'my-lib'
const checkIfContextIsImported = (filePath, root) => {
  let importedContext = false;

  // Check for ES6 import { context } from 'my-lib' or any variable name
  root
    .find(j.ImportDeclaration)
    .forEach(path => {
      if (path.node.source.value === 'my-lib') {
        const importSpecifiers = path.node.specifiers;
        importedContext = importSpecifiers.some(specifier => {
          return specifier.imported &&
            (specifier.imported.name === 'getProfile' ||
              specifier.imported.name === 'context' ||
              specifier.local.name === 'context');
        });
      }
    });

  // Check for CommonJS require('my-lib').context or similar variable name
  root
    .find(j.VariableDeclaration)
    .forEach(path => {
      path.node.declarations.forEach(declarator => {
        if (declarator.init && declarator.init.type === 'CallExpression' &&
          declarator.init.callee.name === 'require' &&
          declarator.init.arguments[0].value === 'my-lib') {
          importedContext = true;
        }
      });
    });

  return importedContext;
};

// Function to check which files are importing from the files that export context
const checkForImportsFromExports = (projectDir, exportingFiles) => {
  const importingFromExports = [];
  const exportFilePaths = exportingFiles.map(file => path.relative(projectDir, file).replace(/\..*$/, ''));

  const files = fs.readdirSync(projectDir);
  files.forEach(file => {
    const filePath = path.join(projectDir, file);
    if (fs.lstatSync(filePath).isFile() && filePath.endsWith('.js')) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileRoot = j(fileContent);

      // Check for import statements
      fileRoot
        .find(j.ImportDeclaration)
        .forEach(path => {
          const sourceValue = path.node.source.value.split('/').pop();
          // console.log("File Path", filePath, sourceValue, exportFilePaths);
          if (exportFilePaths.includes(sourceValue)) {
            importingFromExports.push(filePath);
          }
        });

      // Check for require calls
      fileRoot
        .find(j.VariableDeclaration)
        .forEach(path => {
          path.node.declarations.forEach(declarator => {
            if (declarator.init && declarator.init.type === 'CallExpression' &&
              declarator.init.callee.name === 'require') {
              const requiredPath = declarator.init.arguments[0].value.split('/').pop();
              // console.log("File Path", filePath, requiredPath, exportFilePaths);
              if (exportFilePaths.includes(requiredPath)) {
                importingFromExports.push(filePath);
              }
            }
          });
        });
    }
  });

  return importingFromExports;
};


// Function to gather files exporting or importing context
const gatherFilesWithContext = (projectDir) => {
  const filesWithExportsAndImports = {exporting: [], importing: [], importingFromExports: []};

  const files = fs.readdirSync(projectDir);
  files.forEach(file => {
    const filePath = path.join(projectDir, file);
    if (fs.lstatSync(filePath).isFile() && filePath.endsWith('.js')) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileRoot = j(fileContent);

      // Check if file imports context from 'my-lib'
      if (checkIfContextIsImported(filePath, fileRoot)) {
        filesWithExportsAndImports.importing.push(filePath);
      }

      // Check if file exports context or derived variables
      if (checkIfContextIsExported(filePath, fileRoot)) {
        filesWithExportsAndImports.exporting.push(filePath);
      }
    }
  });

  // Only check for imports from exported files if there are any files exporting context
  if (filesWithExportsAndImports.exporting.length > 0) {
    filesWithExportsAndImports.importingFromExports = checkForImportsFromExports(projectDir, filesWithExportsAndImports.exporting);
  }

  fs.writeFileSync('filesWithExportsAndImports.json', JSON.stringify(filesWithExportsAndImports, null, 2));
  return filesWithExportsAndImports;
};

const readFilesWithExportsAndImports = () => {
  const filePath = path.resolve(__dirname, '../../../filesWithExportsAndImports.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Load context from JSON file
const loadContext = () => {
  if (fs.existsSync(contextFile)) {
    return JSON.parse(fs.readFileSync(contextFile, 'utf-8'));
  }
  return {imports: {}, aliases: {}, exports: {}, importsAll: {}, aliasesAll: {}, exportsAll: {}}; // Default empty context if no file exists
};

// Save context to JSON file
const saveContext = (context) => {
  fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
};

// Modified functions to use persistent context
const findAndExtractImports = (fileInfo, context, root) => {
  root.find(j.ImportDeclaration).forEach(path => {
    const sourceFile = path.node.source.value;
    path.node.specifiers.forEach(specifier => {
      context.imports[specifier.local.name] = {
        sourceFile,
        importedAs: specifier.imported?.name || specifier.local.name
      };
      context.importsAll[fileInfo.path + "-" + specifier.local.name] = {
        sourceFile,
        importedAs: specifier.imported?.name || specifier.local.name
      };
    });
  });
};

const findAndExtractVariables = (fileInfo, context, root) => {
  root.find(j.VariableDeclarator).forEach(path => {
    if (path.node.init && path.node.init.type === 'Identifier') {
      const original = path.node.init.name;
      const alias = path.node.id.name;
      console.log("Alias", alias, original);
      context.aliases[alias || original] = context.imports[original]; // || context.aliases[original];
      context.aliasesAll[fileInfo.path + "-" + (alias || original)] = context.imports[original]; // || context.aliases[original];
    }
  });
};

const findAndExtractExports = (fileInfo, context, root) => {
  root.find(j.ExportNamedDeclaration).forEach(path => {
    path.node.specifiers?.forEach(specifier => {
      console.log("Exported", specifier.exported.name, specifier.local.name);
      context.exports[fileInfo.path + "-" + specifier.exported.name] = context.aliases[specifier.local.name] || context.imports[specifier.local.name];
    });
  });
};

// Transformation function
const updateContext = (fileInfo, root) => {
  console.log("Processing file", fileInfo.path)
  let context = loadContext();

  findAndExtractImports(fileInfo, context, root);
  findAndExtractVariables(fileInfo, context, root);
  findAndExtractExports(fileInfo, context, root);

  saveContext(context, contextFile); // Save context after the transformation
};

module.exports = {
  findAndReplaceProperty,
  gatherFilesWithContext,
  readFilesWithExportsAndImports,
  findAndExtractImports,
  findAndExtractVariables,
  findAndExtractExports,
  updateContext,
  loadContext
}