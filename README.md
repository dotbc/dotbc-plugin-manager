# cardstack-plugin-manager

#### cardstack-plugin-manager is a utility for creating, verifying, and installing cardstack plugins.

cardstack-desktop uses cardstack-plugin-manager to load and run plugins, and cardstack-plugin-manager provides utilities plugin makers can leverage to develop additional functionality for cardstack-desktop.

```javascript
// example plugin index.js mainFile
const cdem = require('cardstack-plugin-manager');
const Plugin = require('./plugin');

let interval;

// register resource paths to for expansion from relative to absolute paths
cdem.registerResourcePath('capabilities.search.imageUrl');
cdem.registerResourcePath('capabilities.search.searchImageUrl');

module.exports.activate = function (cb) {
  cb(null, new Plugin());
};

module.exports.deactivate = function () {
  console.log('plugin deactivated');
}

/// matching package.json:

{
  "name": "my-plugin",
  "displayName": "My Plugin",
  "version": "0.0.0",
  "description": "example plugin for dotBC",
  "publisher": "dotBC",
  "main": "index.js",
  "capabilities": {
    "search": {
      "name": "My Search API",
      "description": "Look up artists on my api.",
      "imageUrl": "public/images/icon.png",
      "searchImageUrl": "public/images/icon-search.png",
      "supportedSearchTypes": [
        "artist", "work"
      ],
      "commands": [
        "search",
        "getDetails"
      ]
    }
  },
  "author": "",
  "license": "MIT",
  "dependencies": {
    "cardstack-plugin-manager": "git+ssh://git@github.com/dotbc/cardstack-plugin-manager.git",
    "debug": "^2.2.0",
    "lodash": "^4.15.0",
    "superagent": "^2.2.0"
  }
}


```

## CardstackPluginManager
{Function} CardstackPluginManager

**Kind**: global class  
**Requires**: <code>module:events</code>, <code>module:debug</code>, <code>module:lodash.get</code>, <code>module:path</code>, <code>module:lodash.set</code>  
**License**: MIT  

* [CardstackPluginManager](#CardstackPluginManager)
    * [._onMessage(msg)](#CardstackPluginManager+_onMessage)
    * [._activatePluginCapabilities(msg)](#CardstackPluginManager+_activatePluginCapabilities)
    * [.activateRpcMethod(plugin, name, type)](#CardstackPluginManager+activateRpcMethod)
    * [.activate(plugin, name, type)](#CardstackPluginManager+activate)
    * [.connect(pkg)](#CardstackPluginManager+connect)
    * [.load(pkg)](#CardstackPluginManager+load)
    * [.registerResourcePath(propertyPath)](#CardstackPluginManager+registerResourcePath)
    * [.sendEvent(name, params)](#CardstackPluginManager+sendEvent)

<a name="CardstackPluginManager+_onMessage"></a>

### cardstackPluginManager._onMessage(msg)
Internal: handles messages passed to plugin process via ipc.

**Kind**: instance method of <code>[CardstackPluginManager](#CardstackPluginManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Object</code> | message object passed from main process to plugin process. |

<a name="CardstackPluginManager+_activatePluginCapabilities"></a>

### cardstackPluginManager._activatePluginCapabilities(msg)
Internal: iterates through and activates all plugin capabilities provided in 
package.json

**Kind**: instance method of <code>[CardstackPluginManager](#CardstackPluginManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Object</code> | message object passed from main process to plugin process. |

<a name="CardstackPluginManager+activateRpcMethod"></a>

### cardstackPluginManager.activateRpcMethod(plugin, name, type)
Wires up IPC mechanics required to perform rpc from the dotBC main process, via the
renderer process, to plugin processes and vice versa. 

activateRpcMethod creates a strategy function used to process incoming messages passed 
to the plugin process via IPC. Functions route incoming message parameters to be applied 
to command methods or event handlers defined on the provided plugin instance.

**Kind**: instance method of <code>[CardstackPluginManager](#CardstackPluginManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>Object</code> | plugin instance |
| name | <code>String</code> | the name of the command or event. |
| type | <code>String</code> | type method type [command|event]. |

<a name="CardstackPluginManager+activate"></a>

### cardstackPluginManager.activate(plugin, name, type)
Third stage of dotBC plugin loading lifecycle. the activate method is called after
a plugin is connected. this method in turn calls the plugin.activate method definted 
on the plugin instance being started. after the plugin's activate function completes
and config-defined capabilities and their commands and events are activated. When
complete, this function emits an 'activated' event.

**Kind**: instance method of <code>[CardstackPluginManager](#CardstackPluginManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>Object</code> | plugin instance |
| name | <code>String</code> | the name of the command or event. |
| type | <code>String</code> | type method type [command|event]. |

<a name="CardstackPluginManager+connect"></a>

### cardstackPluginManager.connect(pkg)
Second stage of dotBC plugin loading lifecycle. Connect sends a message
to the main process, signaling that a plugin has started but not yet activated. Connect
emits a 'connected' event locally.

**Kind**: instance method of <code>[CardstackPluginManager](#CardstackPluginManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| pkg | <code>Object</code> | plugin package.json object |

<a name="CardstackPluginManager+load"></a>

### cardstackPluginManager.load(pkg)
First stage of dotBC plugin loading lifecycle. the activate method is called after
a plugin is connected. this method in turn calls the plugin.activate method definted 
on the plugin instance being started. after the plugin's activate function completes
and config-defined capabilities and their commands and events are activated. When
complete, this function emits an 'activated' event.

**Kind**: instance method of <code>[CardstackPluginManager](#CardstackPluginManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| pkg | <code>Object</code> | plugin package.json object |

<a name="CardstackPluginManager+registerResourcePath"></a>

### cardstackPluginManager.registerResourcePath(propertyPath)
Registers a path defined in a plugin's package.json to be expanded from relative
to absolute. Not registering a resource path for expansion may result in 
resources being improperly rendered.

**Kind**: instance method of <code>[CardstackPluginManager](#CardstackPluginManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| propertyPath | <code>String</code> | dot separated path of json property, located in a plugin's package.json structure |

<a name="CardstackPluginManager+sendEvent"></a>

### cardstackPluginManager.sendEvent(name, params)
Sends an event to the main process via an IPC message.

**Kind**: instance method of <code>[CardstackPluginManager](#CardstackPluginManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | name of the event being sent. |
| params | <code>Object</code> | data parameters of the event being sent. |

