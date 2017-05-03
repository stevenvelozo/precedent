/**
* Test Harness for Precedent
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/
var testPrecedent = require('../source/Precedent.js').new();

testPrecedent.addPattern('<%', '%>', 'JUNKED_THIS_DATA');
// This one gets the count of the inner string...
testPrecedent.addPattern('<%#', '%>', (pData)=>{return pData.length});
// Replaces the string with the settings object...
testPrecedent.addPattern('<%=', '%>', (pData)=>{return JSON.stringify(testPrecedent.settings);});
// This just escapes out pairs of $
testPrecedent.addPattern('$');

console.log(JSON.stringify(testPrecedent.tree,null,4));

var tmpTemplates = [
    'ABC123 <%#Count this, jerks!%>'
];
var tmpResults = [];

//tmpResult = testPrecedent.parseString('');
//tmpResult = testPrecedent.parseString('ABC123');

for (var i = 0; i < tmpTemplates.length; i++)
{
    console.log("\n______________________");
    console.log(`Parsing template ${i}:\n`);
    console.log(tmpTemplates[i]);
    
    tmpResults.push(testPrecedent.parseString(tmpTemplates[i]));
    console.log(`\n...${i} parse result:\n`);
    console.log(tmpResults[i]);
}