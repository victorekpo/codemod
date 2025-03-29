const {loadContext} = require("./utils");

const showResults = () => {
  const context = loadContext()
  console.log("*** Context:", context, "***");
}

module.exports = {
  showResults
}