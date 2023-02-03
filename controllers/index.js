const fs = require("fs");
const modules = [];
fs.readdirSync(__dirname).forEach((file) => {
  if (file[0] === "." || file === "index.js" || file.indexOf("_") !== -1) {
    return;
  }
  modules.push(require(`${__dirname}/${file}`));
});

module.exports = modules;
