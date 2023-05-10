/**
* Simple browser shim loader - assign the npm module to a window global automatically
*
* @author <steven@velozo.com>
*/
var libNPMModuleWrapper = require('./Precedent.js');

if ((typeof(window) == 'object') && (!window.hasOwnProperty('Precedent')))
{
	window.Precedent = libNPMModuleWrapper;
}

module.exports = libNPMModuleWrapper;