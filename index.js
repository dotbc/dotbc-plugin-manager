const debug = require('debug')('dotbc-plugin-manager');
const events = require('events');
const EventEmitter = events.EventEmitter;
const get = require('lodash.get');
const path = require('path');
const set = require('lodash.set');

/**
 * Helper class used to load, connect, and activate dotBC Plugins.
 *
 * @class {Function} PluginManager
 * @requires events
 * @requires debug
 * @requires lodash.get
 * @requires path
 * @requires lodash.set
 * @license MIT
 * @example
 *
 *    // example plugin index.js mainFile
 *    const dbcpm = require('dotbc-plugin-manager');
 *    const Plugin = require('./plugin');
 *    
 *    let interval;
 *    
 *    // register resource paths to for expansion from relative to absolute paths
 *    dbcpm.registerResourcePath('capabilities.search.imageUrl');
 *    dbcpm.registerResourcePath('capabilities.search.searchImageUrl');
 *    
 *    module.exports.activate = function (cb) {
 *      cb(null, new Plugin());
 *    };
 *    
 *    module.exports.deactivate = function () {
 *      console.log('plugin deactivated');
 *    }
 *
 */
class PluginManager extends EventEmitter {
  constructor () {
    super();
    this.commandNames = new Map();
    this.rpcMethods = {
      event: new Map(),
      command: new Map(),
    };
    this.pluginName = null;
    process.on('message', this._onMessage.bind(this))
  }

  /**
    * Internal: handles messages passed to plugin process via ipc. 
    *
    * @param  {Object} msg  message object passed from main process to plugin process.
    */
  _onMessage (msg) {

    if (msg.type === 'command' && msg.name) {
      const commandName = `plugin:${this.pluginName}:command:${msg.name}`;
      const fn = this.rpcMethods.command.get(commandName);

      if ( ! fn) return;

      fn.apply(fn, msg.params);

    } else if (msg.type === 'event' && msg.name) {
      const eventType = `plugin:${this.pluginName}:event:${msg.name}`;
      const fn = this.rpcMethods.event.get(eventType);

      if ( ! fn) return;

      fn(msg.params);

    }

  }

  /**
    * Internal: iterates through and activates all plugin capabilities provided in 
    * package.json 
    *
    * @param  {Object} msg  message object passed from main process to plugin process.
    */
  _activatePluginCapabilities (pkg, plugin) {

    // loop through each plugin capability (search, etc) and perform activate logic
    // to allow commands to be proxied from plugin processes -> main process ->
    // renderer process, and back.
    Object.keys(pkg.capabilities).forEach((c) => {

      const capability = pkg.capabilities[c];

      if (capability.commands && capability.commands instanceof Array) {
      
        capability.commands.forEach((command) => {

          // wire up command rpc logic
          this.activateRpcMethod(plugin, command, 'command');
          
        });
        
      }

      if (capability.events && capability.events instanceof Array) {

        capability.events.forEach((event) => {

          // wire up event rpc logic
          this.activateRpcMethod(plugin, event, 'event');
          
        });

      } 

    });

  }

  /**
    * Wires up IPC mechanics required to perform rpc from the dotBC main process, via the
    * renderer process, to plugin processes and vice versa. 
    * 
    * activateRpcMethod creates a strategy function used to process incoming messages passed 
    * to the plugin process via IPC. Functions route incoming message parameters to be applied 
    * to command methods or event handlers defined on the provided plugin instance. 
    *
    * @param  {Object} plugin  plugin instance
    * @param  {String} name  the name of the command or event.
    * @param  {String} type    type method type [command|event].
    */
  activateRpcMethod (plugin, name, type) {
    const eventName = `plugin:${this.pluginName}:${type}:${name}`;
    this.rpcMethods[type].set(eventName, (function () {
      var args = Array.prototype.slice.call(arguments);
      function callback (err, result) {
        if (err) {
          return process.send({ type: 'error', params: err });
        }
        process.send({ type: type, name: eventName, params: result });
      } 
      args.push(callback);
      plugin[name].apply(plugin, args);
    }));
  }

  /**
      * Third stage of dotBC plugin loading lifecycle. the activate method is called after
    * a plugin is connected. this method in turn calls the plugin.activate method definted 
    * on the plugin instance being started. after the plugin's activate function completes
    * and config-defined capabilities and their commands and events are activated. When
    * complete, this function emits an 'activated' event.
    *
    * @param  {Object} plugin  plugin instance
    * @param  {String} name  the name of the command or event.
    * @param  {String} type    type method type [command|event].
    */
  activate (pkg, mainModule) {

    if ( ! mainModule.activate) throw new Error(`plugin main module at ${mainModule} does not implement an 'activate' method. please implement one.`);

    this.pluginName = pkg.name;
    
    mainModule.activate((err, plugin) => {
      if (err) return cb(err);

      this._activatePluginCapabilities(pkg, plugin);

      this.emit('activated', pkg);

      this.sendEvent('activated', pkg);

    });

  }

  /**
    * Second stage of dotBC plugin loading lifecycle. Connect sends a message
    * to the main process, signaling that a plugin has started but not yet activated. Connect
    * emits a 'connected' event locally.
    *
    * @param  {Object} pkg  plugin package.json object
    */
  connect (pkg) {
    this.emit('connected', pkg);
    this.sendEvent('connected', pkg);
  }

  /**
    * First stage of dotBC plugin loading lifecycle. the activate method is called after
    * a plugin is connected. this method in turn calls the plugin.activate method definted 
    * on the plugin instance being started. after the plugin's activate function completes
    * and config-defined capabilities and their commands and events are activated. When
    * complete, this function emits an 'activated' event.
    *
    * @param  {Object} pkg  plugin package.json object
    */
  load (pkg) {
    this.emit('loaded', pkg);
  }

  /**
    * Registers a path defined in a plugin's package.json to be expanded from relative
    * to absolute. Not registering a resource path for expansion may result in 
    * resources being improperly rendered.  
    *
    * @param  {String} propertyPath  dot separated path of json property, located in a plugin's package.json structure
    */
  registerResourcePath (propertyPath) {
    this.once('loaded', (pkg) => {
      var relativePath = get(pkg, propertyPath);
      var absolutePath = path.join(process.cwd(), relativePath);
      set(pkg, propertyPath, absolutePath);
    });
  }

  /**
    * Sends an event to the main process via an IPC message.  
    *
    * @param  {String} name  name of the event being sent.
    * @param  {Object} params  data parameters of the event being sent.
    */
  sendEvent (name, params) {
    process.send({
      type: 'event',
      name: name,
      params: params
    })
  }
}

module.exports = new PluginManager();