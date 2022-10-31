/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Precedent browser shim loader
*/

// Load the precedent module into the browser global automatically.
var libPrecedent = require('./Precedent.js');

if ((typeof(window) == 'object') && (!window.hasOwnProperty('Precedent')))
{
	window.Precedent = libPrecedent;
}

module.exports = libPrecedent;