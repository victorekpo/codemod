module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  return j(fileInfo.source)
    .find(j.FunctionDeclaration)
    .forEach(path => {
      const params = path.node.params;
      if (params.length === 0) {
        // Add the parameter if it does not exist
        params.push(j.identifier('name'));
      } else {
        const param = params[0]; // Targeting the first parameter
        if (param.name === 'name') {
          param.name = 'fullName';
        } else {
          param.name = 'name';
        }
      }
    })
    .toSource();
};