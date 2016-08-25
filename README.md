<a name="CardstackExtensionManager"></a>

## CardstackExtensionManager
{Function} CardstackExtensionManager

**Kind**: global class  
**Requires**: <code>module:events</code>, <code>module:debug</code>, <code>module:lodash.get</code>, <code>module:path</code>, <code>module:lodash.set</code>  
**License**: MIT  

* [CardstackExtensionManager](#CardstackExtensionManager)
    * [._onMessage(msg)](#CardstackExtensionManager+_onMessage)
    * [._activatePluginCapabilities(msg)](#CardstackExtensionManager+_activatePluginCapabilities)
    * [.activateRpcMethod(plugin, name, type)](#CardstackExtensionManager+activateRpcMethod)
    * [.activate(plugin, name, type)](#CardstackExtensionManager+activate)
    * [.connect(pkg)](#CardstackExtensionManager+connect)
    * [.load(pkg)](#CardstackExtensionManager+load)
    * [.registerResourcePath(propertyPath)](#CardstackExtensionManager+registerResourcePath)
    * [.sendEvent(name, params)](#CardstackExtensionManager+sendEvent)

<a name="CardstackExtensionManager+_onMessage"></a>

### cardstackExtensionManager._onMessage(msg)
Internal: handles messages passed to plugin process via ipc.

**Kind**: instance method of <code>[CardstackExtensionManager](#CardstackExtensionManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Object</code> | message object passed from main process to plugin process. |

<a name="CardstackExtensionManager+_activatePluginCapabilities"></a>

### cardstackExtensionManager._activatePluginCapabilities(msg)
Internal: iterates through and activates all plugin capabilities provided in 
package.json

**Kind**: instance method of <code>[CardstackExtensionManager](#CardstackExtensionManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Object</code> | message object passed from main process to plugin process. |

<a name="CardstackExtensionManager+activateRpcMethod"></a>

### cardstackExtensionManager.activateRpcMethod(plugin, name, type)
Wires up IPC mechanics required to perform rpc from the dotBC main process, via the
renderer process, to plugin processes and vice versa. 

activateRpcMethod creates a strategy function used to process incoming messages passed 
to the plugin process via IPC. Functions route incoming message parameters to be applied 
to command methods or event handlers defined on the provided plugin instance.

**Kind**: instance method of <code>[CardstackExtensionManager](#CardstackExtensionManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>Object</code> | plugin instance |
| name | <code>String</code> | the name of the command or event. |
| type | <code>String</code> | type method type [command|event]. |

<a name="CardstackExtensionManager+activate"></a>

### cardstackExtensionManager.activate(plugin, name, type)
Third stage of dotBC plugin loading lifecycle. the activate method is called after
a plugin is connected. this method in turn calls the plugin.activate method definted 
on the plugin instance being started. after the plugin's activate function completes
and config-defined capabilities and their commands and events are activated. When
complete, this function emits an 'activated' event.

**Kind**: instance method of <code>[CardstackExtensionManager](#CardstackExtensionManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>Object</code> | plugin instance |
| name | <code>String</code> | the name of the command or event. |
| type | <code>String</code> | type method type [command|event]. |

<a name="CardstackExtensionManager+connect"></a>

### cardstackExtensionManager.connect(pkg)
Second stage of dotBC plugin loading lifecycle. Connect sends a message
to the main process, signaling that a plugin has started but not yet activated. Connect
emits a 'connected' event locally.

**Kind**: instance method of <code>[CardstackExtensionManager](#CardstackExtensionManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| pkg | <code>Object</code> | plugin package.json object |

<a name="CardstackExtensionManager+load"></a>

### cardstackExtensionManager.load(pkg)
First stage of dotBC plugin loading lifecycle. the activate method is called after
a plugin is connected. this method in turn calls the plugin.activate method definted 
on the plugin instance being started. after the plugin's activate function completes
and config-defined capabilities and their commands and events are activated. When
complete, this function emits an 'activated' event.

**Kind**: instance method of <code>[CardstackExtensionManager](#CardstackExtensionManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| pkg | <code>Object</code> | plugin package.json object |

<a name="CardstackExtensionManager+registerResourcePath"></a>

### cardstackExtensionManager.registerResourcePath(propertyPath)
Registers a path defined in a plugin's package.json to be expanded from relative
to absolute. Not registering a resource path for expansion may result in 
resources being improperly rendered.

**Kind**: instance method of <code>[CardstackExtensionManager](#CardstackExtensionManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| propertyPath | <code>String</code> | dot separated path of json property, located in a plugin's package.json structure |

<a name="CardstackExtensionManager+sendEvent"></a>

### cardstackExtensionManager.sendEvent(name, params)
Sends an event to the main process via an IPC message.

**Kind**: instance method of <code>[CardstackExtensionManager](#CardstackExtensionManager)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | name of the event being sent. |
| params | <code>Object</code> | data parameters of the event being sent. |

