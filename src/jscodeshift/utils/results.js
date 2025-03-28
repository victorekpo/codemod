const {loadContext} = require("./utils");

const showResults = () => {
  const myProfile = loadContext()
  console.log("*** Context:", context, "***");
}

module.exports = {
  showResults
}