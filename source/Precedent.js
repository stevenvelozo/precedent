/**
* Precedent Meta-Templating
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Process text streams, parsing out meta-template expressions.
*/
var libLodash = require('lodash');

var Precedent = function(pSettings)
{
    // See if any settings were passed in
    var tmpPassedSettings = (typeof(pSettings) === 'object') ? pSettings : {};
    // Get the default settings (and command-line options)
    var tmpSettings = libLodash.assign(require('./Precedent-Options.js'), tmpPassedSettings);
    // Construct fable
	var _Fable = require('fable').new(tmpSettings);

	_Fable.log.info('Initializing precedent...')
	_Fable.log.info('Initializing precedent...')
	_Fable.log.info('Initializing precedent...')
	_Fable.log.info('Initializing precedent...')
};

module.exports = Precedent;