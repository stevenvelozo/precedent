/**
* Unit tests for Precedent
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;
//var Assert = Chai.assert;

var libPrecedent = require('../source/Precedent.js');

var loadPrecedentModule = () =>
{
	return new libPrecedent();
};

var configPrecedent = (pModule) =>
{
	pModule.addPattern('<%', '%>', 'JUNKED_THIS_DATA');
	// This one gets the count of the inner string...
	pModule.addPattern('<%#', '%>', (pData)=>{return pData.length});
	// Replaces the string with the settings object...
	pModule.addPattern('<%=', '%>', (pData)=>{return JSON.stringify(pModule.settings);});
	// This just escapes out pairs of $
	pModule.addPattern('$');
};

suite
(
	'Precedent',
	function()
	{
		setup
		(
			() =>
			{
			}
		);

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'The class should initialize itself into a happy little object.',
					(fDone) =>
					{
						var testPrecedent = loadPrecedentModule();
						// Instantiate a metatemplate processor
						Expect(testPrecedent).to.be.an('object', 'Precedent should initialize as an object directly from the require statement.');
						Expect(testPrecedent.ParseTree).to.be.an('object');
						Expect(testPrecedent.addPattern).to.be.a('function');
						Expect(testPrecedent.parseString).to.be.a('function');
						fDone();
					}
				);
				test
				(
					'Basic pattern replacement...',
					(fDone) =>
					{
						var testPrecedent = loadPrecedentModule();
						
						Expect(Object.keys(testPrecedent.ParseTree).length).to.equal(0, 'There should be an empty tree on initialization.');
						configPrecedent(testPrecedent);
						Expect(Object.keys(testPrecedent.ParseTree).length).to.equal(2, 'The tree should grow properly.');

						//console.log(JSON.stringify(testPrecedent.tree,null,4));
						
						var tmpResult = testPrecedent.parseString('');
						Expect(tmpResult.length).to.equal(0, 'Parsing Empty Strings should Work...');

						fDone();
					}
				);
				test
				(
					'No Matches...',
					(fDone) =>
					{
						var tmpTestString = 'ABC123';
						var tmpExpectedResult = tmpTestString;
						var testPrecedent = loadPrecedentModule();
						configPrecedent(testPrecedent);
						var	tmpResult = testPrecedent.parseString(tmpTestString);
						Expect(tmpResult).to.equal(tmpExpectedResult);
						fDone();
					}
				);
				test
				(
					'Count function...',
					(fDone) =>
					{
						var tmpTestString = 'There are <%#0123456789%> characters in here';
						var tmpExpectedResult = 'There are 10 characters in here';
						var testPrecedent = loadPrecedentModule();
						configPrecedent(testPrecedent);
						var	tmpResult = testPrecedent.parseString(tmpTestString);
						Expect(tmpResult).to.equal(tmpExpectedResult);
						fDone();
					}
				);
				test
				(
					'Multiple terms...',
					(fDone) =>
					{
						var tmpTestString = 'There are <%#12345%> characters in here and a $comment$ as well.  And we <% Some data in here %> right up.';
						var tmpExpectedResult = 'There are 5 characters in here and a comment as well.  And we JUNKED_THIS_DATA right up.';
						var testPrecedent = loadPrecedentModule();
						configPrecedent(testPrecedent);
						var	tmpResult = testPrecedent.parseString(tmpTestString);
						Expect(tmpResult).to.equal(tmpExpectedResult);
						fDone();
					}
				);
				test
				(
					'Identifier fallback...',
					(fDone) =>
					{
						var testPrecedent = loadPrecedentModule();
						testPrecedent.addPattern('<', '>', 'SHORTEST_MATCH');
						testPrecedent.addPattern('<<', '>', 'MEDIUM_MATCH');
						testPrecedent.addPattern('<<EXTRALONG', '>', 'EXTRA_LONG_MATCH');

						var tmpTestStrings = [
							'Match this <> and this <here> please.',
							'Match this SHORTEST_MATCH and this SHORTEST_MATCH please.',

							'Match this <<> and this <<here> please.',
							'Match this MEDIUM_MATCH and this MEDIUM_MATCH please.',

							'Match this <<EXTRA> and this <<here> please.',
							'Match this MEDIUM_MATCH and this MEDIUM_MATCH please.',

							'Match this <<EXTRALONG> and this <<here> please.',
							'Match this EXTRA_LONG_MATCH and this MEDIUM_MATCH please.',

							'Match this <<<<> and this <here> please.',
							'Match this MEDIUM_MATCH and this SHORTEST_MATCH please.'
						];

						var	tmpResult = '';
						// Test every pair in TestStrings
						for (var i = 0; i < tmpTestStrings.length; i+=2)
						{
							tmpResult = testPrecedent.parseString(tmpTestStrings[i]);
							Expect(tmpResult).to.equal(tmpTestStrings[i+1]);
						}
						fDone();
					}
				);
			}
		);
	}
);