const path = require('path');

module.exports = (mainFilePath, cb) => {

  const dirname = path.dirname(mainFilePath);

  const package = require(path.join(dirname, './package.json'));

  process.on('SIGINT', function () {
    console.log(`received SIGINT from parent. terminating child ${package.name}`);
    process.exit();
  });

  process.on('SIGTERM', function () {
    console.log(`received SIGTERM from parent. terminating child ${package.name}`);
    process.exit();
  });

  console.log(`starting cardstack extension ${package.name} with entry point ${mainFilePath}`)
  
  const main = require(mainFilePath);

  main.activate(cb);
  
}
