const cdem = require('../index');
const debug = require('debug')('cardstack-extension-manager');
const path = require('path');

module.exports = (mainFilePath, cb) => {

  const dirname = path.dirname(mainFilePath);

  const package = require(path.join(dirname, './package.json'));

  const debugExtension = require('debug')(`cardstack-extension-manager-${package.name}`);

  process.on('SIGINT', function () {
    console.log(`received SIGINT from parent. terminating child ${package.displayName || package.name}`);
    process.exit();
  });

  process.on('SIGTERM', function () {
    console.log(`received SIGTERM from parent. terminating child ${package.displayName || package.name}`);
    process.exit();
  });

  debug(`starting cardstack extension ${package.displayName || package.name} with entry point ${mainFilePath}`)

  const main = require(mainFilePath);

  cdem.once('loaded', (extension) => {
    debugExtension(`${extension.displayName || extension.name} loaded`);  
  });

  cdem.once('connected', (extension) => {
    debugExtension(`${extension.displayName || extension.name} connected`);  
  });
  
  cdem.once('activated', (extension) => {
    debugExtension(`${extension.displayName || extension.name} activated`);
  });

  cdem.load(package);

  cdem.connect(package);

  cdem.activate(package, main);

}
