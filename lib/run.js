const cdem = require('../index');
const debug = require('debug')('dotbc-plugin-manager');
const path = require('path');

module.exports = (mainFilePath, cb) => {

  const dirname = path.dirname(mainFilePath);

  const package = require(path.join(dirname, './package.json'));

  const debugPlugin = require('debug')(`dotbc-plugin-manager-${package.name}`);

  process.on('SIGINT', function () {
    console.log(`received SIGINT from parent. terminating child ${package.displayName || package.name}`);
    process.exit();
  });

  process.on('SIGTERM', function () {
    console.log(`received SIGTERM from parent. terminating child ${package.displayName || package.name}`);
    process.exit();
  });

  debug(`starting dotbc plugin ${package.displayName || package.name} with entry point ${mainFilePath}`)

  const main = require(mainFilePath);

  cdem.once('loaded', (plugin) => {
    debugPlugin(`${plugin.displayName || plugin.name} loaded`);  
  });

  cdem.once('connected', (plugin) => {
    debugPlugin(`${plugin.displayName || plugin.name} connected`);  
  });

  cdem.once('activated', (plugin) => {
    debugPlugin(`${plugin.displayName || plugin.name} activated`);
  });

  cdem.load(package);

  cdem.connect(package);

  cdem.activate(package, main);

}
