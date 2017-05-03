/**
* Precedent - Options and Command Line Parsing
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
*/
var libYargs = require('yargs');

/**
* The Default Execution Options
*/
var _OptionsDefault =
{
    Product: "Precedent",
	ProductVersion: require(__dirname+'/../package.json').version,

    LogStreams:[{streamtype:'prettystream',level:'trace'}],

	Command: 'Info',

	InputFileName: null,
	OutputLocation: './build/',
	OutputFileName: 'Precedent_Output',

	// Automatically compile the image/pdf/whatever if it can
	AutomaticallyCompile: false,
	// Automatically load the binary that was generated
	AutomaticallyLoad: false,

	// State for if CLI options are parsed.
	Parsed: false,

	// The current platform
	Platform: 'nix'
};

/**
* Parse the command line options if they haven't been parsed before.
*/
var parseCommandLineOptions = function()
{
	if (_OptionsDefault.Parsed)
	{
		return;
	}

	// The -i InputFileName parameter
	if (libYargs.argv.i !== undefined)
	{
		_OptionsDefault.InputFileName = libYargs.argv.i;
	}

	// The -f OutputLocation parameter (defaults to "./build/")
	if (libYargs.argv.f !== undefined)
		_OptionsDefault.OutputLocation = libYargs.argv.f;

	// The -o OutputFileName parameter (defaults to "Precedent_Output")
	if (libYargs.argv.o !== undefined)
		_OptionsDefault.OutputFileName = libYargs.argv.o;

	// Detect the operating system we're working in
	if (/^win/.test(process.platform))
		_OptionsDefault.Platform = 'windows';
	if (/^darwin/.test(process.platform))
		_OptionsDefault.Platform = 'mac';
};
parseCommandLineOptions();

module.exports = _OptionsDefault;