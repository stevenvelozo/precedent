/**
* Test Harness for Precedent
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/
var libPrecedent = require('../source/Precedent.js');

var testPrecedent = new libPrecedent();

testPrecedent.addPattern('<%', '%>', 'JUNKED_THIS_DATA');
// This one gets the count of the inner string...
testPrecedent.addPattern('<%#', '%>', (pData)=>{return pData.length});
// Replaces the string with the settings object...
testPrecedent.addPattern('<%=', '%>', (pData)=>{return JSON.stringify(testPrecedent.settings);});
// This just escapes out pairs of $
testPrecedent.addPattern('$');
// This parser has the worst comment structure...
testPrecedent.addPattern('^', '^', ()=>{return '';});

console.log(JSON.stringify(testPrecedent.ParseTree,null,4));

var tmpTemplates = [
    'ABC123 <%#Count this, jerks!%>',
    'We are gonna junk <%this data%>.',
    'The dollar signs will be eliminated!  $These dollar signs, specifically.$',
    'There are <%#how many characters are these%> characters in here. ^This is just a comment that will be stripped out.^'
];
var tmpResults = [];

for (var i = 0; i < tmpTemplates.length; i++)
{
    console.log("\n______________________");
    console.log(`Parsing template ${i}:\n`);
    console.log(tmpTemplates[i]);
    
    tmpResults.push(testPrecedent.parseString(tmpTemplates[i]));
    console.log(`\n...${i} parse result:\n`);
    console.log(tmpResults[i]);
}