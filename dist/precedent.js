(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Precedent = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"./Precedent.js":2}],2:[function(require,module,exports){
/**
* Precedent Meta-Templating
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Process text streams, parsing out meta-template expressions.
*/
var libWordTree = require(`./WordTree.js`);
var libStringParser = require(`./StringParser.js`);

class Precedent
{
	/**
	 * Precedent Constructor
	 */
	constructor()
	{
		this.WordTree = new libWordTree();
		
		this.StringParser = new libStringParser();

		this.ParseTree = this.WordTree.ParseTree;
	}
	
	/**
	 * Add a Pattern to the Parse Tree
	 * @method addPattern
	 * @param {Object} pTree - A node on the parse tree to push the characters into
	 * @param {string} pPattern - The string to add to the tree
	 * @param {number} pIndex - callback function
	 * @return {bool} True if adding the pattern was successful
	 */
	addPattern(pPatternStart, pPatternEnd, pParser)
	{
		return this.WordTree.addPattern(pPatternStart, pPatternEnd, pParser);
	}
	
	/**
	 * Parse a string with the existing parse tree
	 * @method parseString
	 * @param {string} pString - The string to parse
	 * @return {string} The result from the parser
	 */
	parseString(pString)
	{
		return this.StringParser.parseString(pString, this.ParseTree);
	}
}

module.exports = Precedent;

},{"./StringParser.js":3,"./WordTree.js":4}],3:[function(require,module,exports){
/**
* String Parser
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Parse a string, properly processing each matched token in the word tree.
*/

class StringParser
{
	/**
	 * StringParser Constructor
	 */
	constructor()
	{
	}
	
	/**
	 * Create a fresh parsing state object to work with.
	 * @method newParserState
	 * @param {Object} pParseTree - A node on the parse tree to begin parsing from (usually root)
	 * @return {Object} A new parser state object for running a character parser on
	 * @private
	 */
	newParserState (pParseTree)
	{
		return (
		{
		    ParseTree: pParseTree,

			Output: '',
			OutputBuffer: '',

			Pattern: false,

			PatternMatch: false,
			PatternMatchOutputBuffer: ''
		});
	}
		
	/**
	 * Assign a node of the parser tree to be the next potential match.
	 * If the node has a PatternEnd property, it is a valid match and supercedes the last valid match (or becomes the initial match).
	 * @method assignNode
	 * @param {Object} pNode - A node on the parse tree to assign
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	assignNode (pNode, pParserState)
	{
		pParserState.PatternMatch = pNode;

		// If the pattern has a END we can assume it has a parse function...
		if (pParserState.PatternMatch.hasOwnProperty('PatternEnd'))
		{
			// ... this is the legitimate start of a pattern.
			pParserState.Pattern = pParserState.PatternMatch;
		}
	}
	
	/**
	 * Append a character to the output buffer in the parser state.
	 * This output buffer is used when a potential match is being explored, or a match is being explored.
	 * @method appendOutputBuffer
	 * @param {string} pCharacter - The character to append
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	appendOutputBuffer (pCharacter, pParserState)
	{
		pParserState.OutputBuffer += pCharacter;
	}
	
	/**
	 * Flush the output buffer to the output and clear it.
	 * @method flushOutputBuffer
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	flushOutputBuffer (pParserState)
	{
		pParserState.Output += pParserState.OutputBuffer;
		pParserState.OutputBuffer = '';
	}

	
	/**
	 * Check if the pattern has ended.  If it has, properly flush the buffer and start looking for new patterns.
	 * @method checkPatternEnd
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	checkPatternEnd (pParserState)
	{
		if ((pParserState.OutputBuffer.length >= pParserState.Pattern.PatternEnd.length+pParserState.Pattern.PatternStart.length) && 
			(pParserState.OutputBuffer.substr(-pParserState.Pattern.PatternEnd.length) === pParserState.Pattern.PatternEnd))
		{
			// ... this is the end of a pattern, cut off the end tag and parse it.
			// Trim the start and end tags off the output buffer now
			pParserState.OutputBuffer = pParserState.Pattern.Parse(pParserState.OutputBuffer.substr(pParserState.Pattern.PatternStart.length, pParserState.OutputBuffer.length - (pParserState.Pattern.PatternStart.length+pParserState.Pattern.PatternEnd.length)));
			// Flush the output buffer.
			this.flushOutputBuffer(pParserState);
			// End pattern mode
			pParserState.Pattern = false;
			pParserState.PatternMatch = false;
		}
	}
	
	/**
	 * Parse a character in the buffer.
	 * @method parseCharacter
	 * @param {string} pCharacter - The character to append
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	parseCharacter (pCharacter, pParserState)
	{
		// (1) If we aren't in a pattern match, and we aren't potentially matching, and this may be the start of a new pattern....
		if (!pParserState.PatternMatch && pParserState.ParseTree.hasOwnProperty(pCharacter))
		{
			// ... assign the node as the matched node.
			this.assignNode(pParserState.ParseTree[pCharacter], pParserState);
			this.appendOutputBuffer(pCharacter, pParserState);
		}
		// (2) If we are in a pattern match (actively seeing if this is part of a new pattern token)
		else if (pParserState.PatternMatch)
		{
			// If the pattern has a subpattern with this key
			if (pParserState.PatternMatch.hasOwnProperty(pCharacter))
			{
				// Continue matching patterns.
				this.assignNode(pParserState.PatternMatch[pCharacter], pParserState);
			}
			this.appendOutputBuffer(pCharacter, pParserState);
			if (pParserState.Pattern)
			{
				// ... Check if this is the end of the pattern (if we are matching a valid pattern)...
				this.checkPatternEnd(pParserState);
			}
		}
		// (3) If we aren't in a pattern match or pattern, and this isn't the start of a new pattern (RAW mode)....
		else
		{
			pParserState.Output += pCharacter;
		}
	}
	
	/**
	 * Parse a string for matches, and process any template segments that occur.
	 * @method parseString
	 * @param {string} pString - The string to parse.
	 * @param {Object} pParseTree - The parse tree to begin parsing from (usually root)
	 */
	parseString (pString, pParseTree)
	{
		let tmpParserState = this.newParserState(pParseTree);

		for (var i = 0; i < pString.length; i++)
		{
			// TODO: This is not fast.
			this.parseCharacter(pString[i], tmpParserState);
		}
		
		this.flushOutputBuffer(tmpParserState);
		
		return tmpParserState.Output;
	}
}

module.exports = StringParser;

},{}],4:[function(require,module,exports){
/**
* Word Tree
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Create a tree (directed graph) of Javascript objects, one character per object.
*/

class WordTree
{
	/**
	 * WordTree Constructor
	 */
	constructor()
	{
		this.ParseTree = {};
	}
	
	/** 
	 * Add a child character to a Parse Tree node
	 * @method addChild
	 * @param {Object} pTree - A parse tree to push the characters into
	 * @param {string} pPattern - The string to add to the tree
	 * @param {number} pIndex - callback function
	 * @returns {Object} The resulting leaf node that was added (or found)
	 * @private
	 */
	addChild (pTree, pPattern, pIndex)
	{
		if (pIndex > pPattern.length)
			return pTree;
		
		if (!pTree.hasOwnProperty(pPattern[pIndex]))
			pTree[pPattern[pIndex]] = {};
		
		return pTree[pPattern[pIndex]];
	}
	
	/** Add a Pattern to the Parse Tree
	 * @method addPattern
	 * @param {Object} pTree - A node on the parse tree to push the characters into
	 * @param {string} pPattern - The string to add to the tree
	 * @param {number} pIndex - callback function
	 * @return {bool} True if adding the pattern was successful
	 */
	addPattern (pPatternStart, pPatternEnd, pParser)
	{
		if (pPatternStart.length < 1)
			return false;

		let tmpLeaf = this.ParseTree;

		// Add the tree of leaves iteratively
		for (var i = 0; i < pPatternStart.length; i++)
			tmpLeaf = this.addChild(tmpLeaf, pPatternStart, i);

		tmpLeaf.PatternStart = pPatternStart;
		tmpLeaf.PatternEnd = ((typeof(pPatternEnd) === 'string') && (pPatternEnd.length > 0)) ? pPatternEnd : pPatternStart;
		tmpLeaf.Parse = (typeof(pParser) === 'function') ? pParser : 
						(typeof(pParser) === 'string') ? () => { return pParser; } :
						(pData) => { return pData; };

		return true;
	}
}

module.exports = WordTree;

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvUHJlY2VkZW50LUJyb3dzZXItU2hpbS5qcyIsInNvdXJjZS9QcmVjZWRlbnQuanMiLCJzb3VyY2UvU3RyaW5nUGFyc2VyLmpzIiwic291cmNlL1dvcmRUcmVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xuXG4vKipcbiogUHJlY2VkZW50IGJyb3dzZXIgc2hpbSBsb2FkZXJcbiovXG5cbi8vIExvYWQgdGhlIHByZWNlZGVudCBtb2R1bGUgaW50byB0aGUgYnJvd3NlciBnbG9iYWwgYXV0b21hdGljYWxseS5cbnZhciBsaWJQcmVjZWRlbnQgPSByZXF1aXJlKCcuL1ByZWNlZGVudC5qcycpO1xuXG5pZiAoKHR5cGVvZih3aW5kb3cpID09ICdvYmplY3QnKSAmJiAoIXdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnUHJlY2VkZW50JykpKVxue1xuXHR3aW5kb3cuUHJlY2VkZW50ID0gbGliUHJlY2VkZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYlByZWNlZGVudDsiLCIvKipcbiogUHJlY2VkZW50IE1ldGEtVGVtcGxhdGluZ1xuKlxuKiBAbGljZW5zZSAgICAgTUlUXG4qXG4qIEBhdXRob3IgICAgICBTdGV2ZW4gVmVsb3pvIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbipcbiogQGRlc2NyaXB0aW9uIFByb2Nlc3MgdGV4dCBzdHJlYW1zLCBwYXJzaW5nIG91dCBtZXRhLXRlbXBsYXRlIGV4cHJlc3Npb25zLlxuKi9cbnZhciBsaWJXb3JkVHJlZSA9IHJlcXVpcmUoYC4vV29yZFRyZWUuanNgKTtcbnZhciBsaWJTdHJpbmdQYXJzZXIgPSByZXF1aXJlKGAuL1N0cmluZ1BhcnNlci5qc2ApO1xuXG5jbGFzcyBQcmVjZWRlbnRcbntcblx0LyoqXG5cdCAqIFByZWNlZGVudCBDb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0dGhpcy5Xb3JkVHJlZSA9IG5ldyBsaWJXb3JkVHJlZSgpO1xuXHRcdFxuXHRcdHRoaXMuU3RyaW5nUGFyc2VyID0gbmV3IGxpYlN0cmluZ1BhcnNlcigpO1xuXG5cdFx0dGhpcy5QYXJzZVRyZWUgPSB0aGlzLldvcmRUcmVlLlBhcnNlVHJlZTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEFkZCBhIFBhdHRlcm4gdG8gdGhlIFBhcnNlIFRyZWVcblx0ICogQG1ldGhvZCBhZGRQYXR0ZXJuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwVHJlZSAtIEEgbm9kZSBvbiB0aGUgcGFyc2UgdHJlZSB0byBwdXNoIHRoZSBjaGFyYWN0ZXJzIGludG9cblx0ICogQHBhcmFtIHtzdHJpbmd9IHBQYXR0ZXJuIC0gVGhlIHN0cmluZyB0byBhZGQgdG8gdGhlIHRyZWVcblx0ICogQHBhcmFtIHtudW1iZXJ9IHBJbmRleCAtIGNhbGxiYWNrIGZ1bmN0aW9uXG5cdCAqIEByZXR1cm4ge2Jvb2x9IFRydWUgaWYgYWRkaW5nIHRoZSBwYXR0ZXJuIHdhcyBzdWNjZXNzZnVsXG5cdCAqL1xuXHRhZGRQYXR0ZXJuKHBQYXR0ZXJuU3RhcnQsIHBQYXR0ZXJuRW5kLCBwUGFyc2VyKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuV29yZFRyZWUuYWRkUGF0dGVybihwUGF0dGVyblN0YXJ0LCBwUGF0dGVybkVuZCwgcFBhcnNlcik7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBQYXJzZSBhIHN0cmluZyB3aXRoIHRoZSBleGlzdGluZyBwYXJzZSB0cmVlXG5cdCAqIEBtZXRob2QgcGFyc2VTdHJpbmdcblx0ICogQHBhcmFtIHtzdHJpbmd9IHBTdHJpbmcgLSBUaGUgc3RyaW5nIHRvIHBhcnNlXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHJlc3VsdCBmcm9tIHRoZSBwYXJzZXJcblx0ICovXG5cdHBhcnNlU3RyaW5nKHBTdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5TdHJpbmdQYXJzZXIucGFyc2VTdHJpbmcocFN0cmluZywgdGhpcy5QYXJzZVRyZWUpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJlY2VkZW50O1xuIiwiLyoqXG4qIFN0cmluZyBQYXJzZXJcbipcbiogQGxpY2Vuc2UgICAgIE1JVFxuKlxuKiBAYXV0aG9yICAgICAgU3RldmVuIFZlbG96byA8c3RldmVuQHZlbG96by5jb20+XG4qXG4qIEBkZXNjcmlwdGlvbiBQYXJzZSBhIHN0cmluZywgcHJvcGVybHkgcHJvY2Vzc2luZyBlYWNoIG1hdGNoZWQgdG9rZW4gaW4gdGhlIHdvcmQgdHJlZS5cbiovXG5cbmNsYXNzIFN0cmluZ1BhcnNlclxue1xuXHQvKipcblx0ICogU3RyaW5nUGFyc2VyIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0fVxuXHRcblx0LyoqXG5cdCAqIENyZWF0ZSBhIGZyZXNoIHBhcnNpbmcgc3RhdGUgb2JqZWN0IHRvIHdvcmsgd2l0aC5cblx0ICogQG1ldGhvZCBuZXdQYXJzZXJTdGF0ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gcFBhcnNlVHJlZSAtIEEgbm9kZSBvbiB0aGUgcGFyc2UgdHJlZSB0byBiZWdpbiBwYXJzaW5nIGZyb20gKHVzdWFsbHkgcm9vdClcblx0ICogQHJldHVybiB7T2JqZWN0fSBBIG5ldyBwYXJzZXIgc3RhdGUgb2JqZWN0IGZvciBydW5uaW5nIGEgY2hhcmFjdGVyIHBhcnNlciBvblxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0bmV3UGFyc2VyU3RhdGUgKHBQYXJzZVRyZWUpXG5cdHtcblx0XHRyZXR1cm4gKFxuXHRcdHtcblx0XHQgICAgUGFyc2VUcmVlOiBwUGFyc2VUcmVlLFxuXG5cdFx0XHRPdXRwdXQ6ICcnLFxuXHRcdFx0T3V0cHV0QnVmZmVyOiAnJyxcblxuXHRcdFx0UGF0dGVybjogZmFsc2UsXG5cblx0XHRcdFBhdHRlcm5NYXRjaDogZmFsc2UsXG5cdFx0XHRQYXR0ZXJuTWF0Y2hPdXRwdXRCdWZmZXI6ICcnXG5cdFx0fSk7XG5cdH1cblx0XHRcblx0LyoqXG5cdCAqIEFzc2lnbiBhIG5vZGUgb2YgdGhlIHBhcnNlciB0cmVlIHRvIGJlIHRoZSBuZXh0IHBvdGVudGlhbCBtYXRjaC5cblx0ICogSWYgdGhlIG5vZGUgaGFzIGEgUGF0dGVybkVuZCBwcm9wZXJ0eSwgaXQgaXMgYSB2YWxpZCBtYXRjaCBhbmQgc3VwZXJjZWRlcyB0aGUgbGFzdCB2YWxpZCBtYXRjaCAob3IgYmVjb21lcyB0aGUgaW5pdGlhbCBtYXRjaCkuXG5cdCAqIEBtZXRob2QgYXNzaWduTm9kZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gcE5vZGUgLSBBIG5vZGUgb24gdGhlIHBhcnNlIHRyZWUgdG8gYXNzaWduXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwUGFyc2VyU3RhdGUgLSBUaGUgc3RhdGUgb2JqZWN0IGZvciB0aGUgY3VycmVudCBwYXJzaW5nIHRhc2tcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFzc2lnbk5vZGUgKHBOb2RlLCBwUGFyc2VyU3RhdGUpXG5cdHtcblx0XHRwUGFyc2VyU3RhdGUuUGF0dGVybk1hdGNoID0gcE5vZGU7XG5cblx0XHQvLyBJZiB0aGUgcGF0dGVybiBoYXMgYSBFTkQgd2UgY2FuIGFzc3VtZSBpdCBoYXMgYSBwYXJzZSBmdW5jdGlvbi4uLlxuXHRcdGlmIChwUGFyc2VyU3RhdGUuUGF0dGVybk1hdGNoLmhhc093blByb3BlcnR5KCdQYXR0ZXJuRW5kJykpXG5cdFx0e1xuXHRcdFx0Ly8gLi4uIHRoaXMgaXMgdGhlIGxlZ2l0aW1hdGUgc3RhcnQgb2YgYSBwYXR0ZXJuLlxuXHRcdFx0cFBhcnNlclN0YXRlLlBhdHRlcm4gPSBwUGFyc2VyU3RhdGUuUGF0dGVybk1hdGNoO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIEFwcGVuZCBhIGNoYXJhY3RlciB0byB0aGUgb3V0cHV0IGJ1ZmZlciBpbiB0aGUgcGFyc2VyIHN0YXRlLlxuXHQgKiBUaGlzIG91dHB1dCBidWZmZXIgaXMgdXNlZCB3aGVuIGEgcG90ZW50aWFsIG1hdGNoIGlzIGJlaW5nIGV4cGxvcmVkLCBvciBhIG1hdGNoIGlzIGJlaW5nIGV4cGxvcmVkLlxuXHQgKiBAbWV0aG9kIGFwcGVuZE91dHB1dEJ1ZmZlclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcENoYXJhY3RlciAtIFRoZSBjaGFyYWN0ZXIgdG8gYXBwZW5kXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwUGFyc2VyU3RhdGUgLSBUaGUgc3RhdGUgb2JqZWN0IGZvciB0aGUgY3VycmVudCBwYXJzaW5nIHRhc2tcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFwcGVuZE91dHB1dEJ1ZmZlciAocENoYXJhY3RlciwgcFBhcnNlclN0YXRlKVxuXHR7XG5cdFx0cFBhcnNlclN0YXRlLk91dHB1dEJ1ZmZlciArPSBwQ2hhcmFjdGVyO1xuXHR9XG5cdFxuXHQvKipcblx0ICogRmx1c2ggdGhlIG91dHB1dCBidWZmZXIgdG8gdGhlIG91dHB1dCBhbmQgY2xlYXIgaXQuXG5cdCAqIEBtZXRob2QgZmx1c2hPdXRwdXRCdWZmZXJcblx0ICogQHBhcmFtIHtPYmplY3R9IHBQYXJzZXJTdGF0ZSAtIFRoZSBzdGF0ZSBvYmplY3QgZm9yIHRoZSBjdXJyZW50IHBhcnNpbmcgdGFza1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Zmx1c2hPdXRwdXRCdWZmZXIgKHBQYXJzZXJTdGF0ZSlcblx0e1xuXHRcdHBQYXJzZXJTdGF0ZS5PdXRwdXQgKz0gcFBhcnNlclN0YXRlLk91dHB1dEJ1ZmZlcjtcblx0XHRwUGFyc2VyU3RhdGUuT3V0cHV0QnVmZmVyID0gJyc7XG5cdH1cblxuXHRcblx0LyoqXG5cdCAqIENoZWNrIGlmIHRoZSBwYXR0ZXJuIGhhcyBlbmRlZC4gIElmIGl0IGhhcywgcHJvcGVybHkgZmx1c2ggdGhlIGJ1ZmZlciBhbmQgc3RhcnQgbG9va2luZyBmb3IgbmV3IHBhdHRlcm5zLlxuXHQgKiBAbWV0aG9kIGNoZWNrUGF0dGVybkVuZFxuXHQgKiBAcGFyYW0ge09iamVjdH0gcFBhcnNlclN0YXRlIC0gVGhlIHN0YXRlIG9iamVjdCBmb3IgdGhlIGN1cnJlbnQgcGFyc2luZyB0YXNrXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRjaGVja1BhdHRlcm5FbmQgKHBQYXJzZXJTdGF0ZSlcblx0e1xuXHRcdGlmICgocFBhcnNlclN0YXRlLk91dHB1dEJ1ZmZlci5sZW5ndGggPj0gcFBhcnNlclN0YXRlLlBhdHRlcm4uUGF0dGVybkVuZC5sZW5ndGgrcFBhcnNlclN0YXRlLlBhdHRlcm4uUGF0dGVyblN0YXJ0Lmxlbmd0aCkgJiYgXG5cdFx0XHQocFBhcnNlclN0YXRlLk91dHB1dEJ1ZmZlci5zdWJzdHIoLXBQYXJzZXJTdGF0ZS5QYXR0ZXJuLlBhdHRlcm5FbmQubGVuZ3RoKSA9PT0gcFBhcnNlclN0YXRlLlBhdHRlcm4uUGF0dGVybkVuZCkpXG5cdFx0e1xuXHRcdFx0Ly8gLi4uIHRoaXMgaXMgdGhlIGVuZCBvZiBhIHBhdHRlcm4sIGN1dCBvZmYgdGhlIGVuZCB0YWcgYW5kIHBhcnNlIGl0LlxuXHRcdFx0Ly8gVHJpbSB0aGUgc3RhcnQgYW5kIGVuZCB0YWdzIG9mZiB0aGUgb3V0cHV0IGJ1ZmZlciBub3dcblx0XHRcdHBQYXJzZXJTdGF0ZS5PdXRwdXRCdWZmZXIgPSBwUGFyc2VyU3RhdGUuUGF0dGVybi5QYXJzZShwUGFyc2VyU3RhdGUuT3V0cHV0QnVmZmVyLnN1YnN0cihwUGFyc2VyU3RhdGUuUGF0dGVybi5QYXR0ZXJuU3RhcnQubGVuZ3RoLCBwUGFyc2VyU3RhdGUuT3V0cHV0QnVmZmVyLmxlbmd0aCAtIChwUGFyc2VyU3RhdGUuUGF0dGVybi5QYXR0ZXJuU3RhcnQubGVuZ3RoK3BQYXJzZXJTdGF0ZS5QYXR0ZXJuLlBhdHRlcm5FbmQubGVuZ3RoKSkpO1xuXHRcdFx0Ly8gRmx1c2ggdGhlIG91dHB1dCBidWZmZXIuXG5cdFx0XHR0aGlzLmZsdXNoT3V0cHV0QnVmZmVyKHBQYXJzZXJTdGF0ZSk7XG5cdFx0XHQvLyBFbmQgcGF0dGVybiBtb2RlXG5cdFx0XHRwUGFyc2VyU3RhdGUuUGF0dGVybiA9IGZhbHNlO1xuXHRcdFx0cFBhcnNlclN0YXRlLlBhdHRlcm5NYXRjaCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIFBhcnNlIGEgY2hhcmFjdGVyIGluIHRoZSBidWZmZXIuXG5cdCAqIEBtZXRob2QgcGFyc2VDaGFyYWN0ZXJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHBDaGFyYWN0ZXIgLSBUaGUgY2hhcmFjdGVyIHRvIGFwcGVuZFxuXHQgKiBAcGFyYW0ge09iamVjdH0gcFBhcnNlclN0YXRlIC0gVGhlIHN0YXRlIG9iamVjdCBmb3IgdGhlIGN1cnJlbnQgcGFyc2luZyB0YXNrXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwYXJzZUNoYXJhY3RlciAocENoYXJhY3RlciwgcFBhcnNlclN0YXRlKVxuXHR7XG5cdFx0Ly8gKDEpIElmIHdlIGFyZW4ndCBpbiBhIHBhdHRlcm4gbWF0Y2gsIGFuZCB3ZSBhcmVuJ3QgcG90ZW50aWFsbHkgbWF0Y2hpbmcsIGFuZCB0aGlzIG1heSBiZSB0aGUgc3RhcnQgb2YgYSBuZXcgcGF0dGVybi4uLi5cblx0XHRpZiAoIXBQYXJzZXJTdGF0ZS5QYXR0ZXJuTWF0Y2ggJiYgcFBhcnNlclN0YXRlLlBhcnNlVHJlZS5oYXNPd25Qcm9wZXJ0eShwQ2hhcmFjdGVyKSlcblx0XHR7XG5cdFx0XHQvLyAuLi4gYXNzaWduIHRoZSBub2RlIGFzIHRoZSBtYXRjaGVkIG5vZGUuXG5cdFx0XHR0aGlzLmFzc2lnbk5vZGUocFBhcnNlclN0YXRlLlBhcnNlVHJlZVtwQ2hhcmFjdGVyXSwgcFBhcnNlclN0YXRlKTtcblx0XHRcdHRoaXMuYXBwZW5kT3V0cHV0QnVmZmVyKHBDaGFyYWN0ZXIsIHBQYXJzZXJTdGF0ZSk7XG5cdFx0fVxuXHRcdC8vICgyKSBJZiB3ZSBhcmUgaW4gYSBwYXR0ZXJuIG1hdGNoIChhY3RpdmVseSBzZWVpbmcgaWYgdGhpcyBpcyBwYXJ0IG9mIGEgbmV3IHBhdHRlcm4gdG9rZW4pXG5cdFx0ZWxzZSBpZiAocFBhcnNlclN0YXRlLlBhdHRlcm5NYXRjaClcblx0XHR7XG5cdFx0XHQvLyBJZiB0aGUgcGF0dGVybiBoYXMgYSBzdWJwYXR0ZXJuIHdpdGggdGhpcyBrZXlcblx0XHRcdGlmIChwUGFyc2VyU3RhdGUuUGF0dGVybk1hdGNoLmhhc093blByb3BlcnR5KHBDaGFyYWN0ZXIpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBDb250aW51ZSBtYXRjaGluZyBwYXR0ZXJucy5cblx0XHRcdFx0dGhpcy5hc3NpZ25Ob2RlKHBQYXJzZXJTdGF0ZS5QYXR0ZXJuTWF0Y2hbcENoYXJhY3Rlcl0sIHBQYXJzZXJTdGF0ZSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmFwcGVuZE91dHB1dEJ1ZmZlcihwQ2hhcmFjdGVyLCBwUGFyc2VyU3RhdGUpO1xuXHRcdFx0aWYgKHBQYXJzZXJTdGF0ZS5QYXR0ZXJuKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyAuLi4gQ2hlY2sgaWYgdGhpcyBpcyB0aGUgZW5kIG9mIHRoZSBwYXR0ZXJuIChpZiB3ZSBhcmUgbWF0Y2hpbmcgYSB2YWxpZCBwYXR0ZXJuKS4uLlxuXHRcdFx0XHR0aGlzLmNoZWNrUGF0dGVybkVuZChwUGFyc2VyU3RhdGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyAoMykgSWYgd2UgYXJlbid0IGluIGEgcGF0dGVybiBtYXRjaCBvciBwYXR0ZXJuLCBhbmQgdGhpcyBpc24ndCB0aGUgc3RhcnQgb2YgYSBuZXcgcGF0dGVybiAoUkFXIG1vZGUpLi4uLlxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRwUGFyc2VyU3RhdGUuT3V0cHV0ICs9IHBDaGFyYWN0ZXI7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogUGFyc2UgYSBzdHJpbmcgZm9yIG1hdGNoZXMsIGFuZCBwcm9jZXNzIGFueSB0ZW1wbGF0ZSBzZWdtZW50cyB0aGF0IG9jY3VyLlxuXHQgKiBAbWV0aG9kIHBhcnNlU3RyaW5nXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwU3RyaW5nIC0gVGhlIHN0cmluZyB0byBwYXJzZS5cblx0ICogQHBhcmFtIHtPYmplY3R9IHBQYXJzZVRyZWUgLSBUaGUgcGFyc2UgdHJlZSB0byBiZWdpbiBwYXJzaW5nIGZyb20gKHVzdWFsbHkgcm9vdClcblx0ICovXG5cdHBhcnNlU3RyaW5nIChwU3RyaW5nLCBwUGFyc2VUcmVlKVxuXHR7XG5cdFx0bGV0IHRtcFBhcnNlclN0YXRlID0gdGhpcy5uZXdQYXJzZXJTdGF0ZShwUGFyc2VUcmVlKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcFN0cmluZy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHQvLyBUT0RPOiBUaGlzIGlzIG5vdCBmYXN0LlxuXHRcdFx0dGhpcy5wYXJzZUNoYXJhY3RlcihwU3RyaW5nW2ldLCB0bXBQYXJzZXJTdGF0ZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuZmx1c2hPdXRwdXRCdWZmZXIodG1wUGFyc2VyU3RhdGUpO1xuXHRcdFxuXHRcdHJldHVybiB0bXBQYXJzZXJTdGF0ZS5PdXRwdXQ7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdHJpbmdQYXJzZXI7XG4iLCIvKipcbiogV29yZCBUcmVlXG4qXG4qIEBsaWNlbnNlICAgICBNSVRcbipcbiogQGF1dGhvciAgICAgIFN0ZXZlbiBWZWxvem8gPHN0ZXZlbkB2ZWxvem8uY29tPlxuKlxuKiBAZGVzY3JpcHRpb24gQ3JlYXRlIGEgdHJlZSAoZGlyZWN0ZWQgZ3JhcGgpIG9mIEphdmFzY3JpcHQgb2JqZWN0cywgb25lIGNoYXJhY3RlciBwZXIgb2JqZWN0LlxuKi9cblxuY2xhc3MgV29yZFRyZWVcbntcblx0LyoqXG5cdCAqIFdvcmRUcmVlIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHR0aGlzLlBhcnNlVHJlZSA9IHt9O1xuXHR9XG5cdFxuXHQvKiogXG5cdCAqIEFkZCBhIGNoaWxkIGNoYXJhY3RlciB0byBhIFBhcnNlIFRyZWUgbm9kZVxuXHQgKiBAbWV0aG9kIGFkZENoaWxkXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwVHJlZSAtIEEgcGFyc2UgdHJlZSB0byBwdXNoIHRoZSBjaGFyYWN0ZXJzIGludG9cblx0ICogQHBhcmFtIHtzdHJpbmd9IHBQYXR0ZXJuIC0gVGhlIHN0cmluZyB0byBhZGQgdG8gdGhlIHRyZWVcblx0ICogQHBhcmFtIHtudW1iZXJ9IHBJbmRleCAtIGNhbGxiYWNrIGZ1bmN0aW9uXG5cdCAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgbGVhZiBub2RlIHRoYXQgd2FzIGFkZGVkIChvciBmb3VuZClcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFkZENoaWxkIChwVHJlZSwgcFBhdHRlcm4sIHBJbmRleClcblx0e1xuXHRcdGlmIChwSW5kZXggPiBwUGF0dGVybi5sZW5ndGgpXG5cdFx0XHRyZXR1cm4gcFRyZWU7XG5cdFx0XG5cdFx0aWYgKCFwVHJlZS5oYXNPd25Qcm9wZXJ0eShwUGF0dGVybltwSW5kZXhdKSlcblx0XHRcdHBUcmVlW3BQYXR0ZXJuW3BJbmRleF1dID0ge307XG5cdFx0XG5cdFx0cmV0dXJuIHBUcmVlW3BQYXR0ZXJuW3BJbmRleF1dO1xuXHR9XG5cdFxuXHQvKiogQWRkIGEgUGF0dGVybiB0byB0aGUgUGFyc2UgVHJlZVxuXHQgKiBAbWV0aG9kIGFkZFBhdHRlcm5cblx0ICogQHBhcmFtIHtPYmplY3R9IHBUcmVlIC0gQSBub2RlIG9uIHRoZSBwYXJzZSB0cmVlIHRvIHB1c2ggdGhlIGNoYXJhY3RlcnMgaW50b1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gcFBhdHRlcm4gLSBUaGUgc3RyaW5nIHRvIGFkZCB0byB0aGUgdHJlZVxuXHQgKiBAcGFyYW0ge251bWJlcn0gcEluZGV4IC0gY2FsbGJhY2sgZnVuY3Rpb25cblx0ICogQHJldHVybiB7Ym9vbH0gVHJ1ZSBpZiBhZGRpbmcgdGhlIHBhdHRlcm4gd2FzIHN1Y2Nlc3NmdWxcblx0ICovXG5cdGFkZFBhdHRlcm4gKHBQYXR0ZXJuU3RhcnQsIHBQYXR0ZXJuRW5kLCBwUGFyc2VyKVxuXHR7XG5cdFx0aWYgKHBQYXR0ZXJuU3RhcnQubGVuZ3RoIDwgMSlcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdGxldCB0bXBMZWFmID0gdGhpcy5QYXJzZVRyZWU7XG5cblx0XHQvLyBBZGQgdGhlIHRyZWUgb2YgbGVhdmVzIGl0ZXJhdGl2ZWx5XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwUGF0dGVyblN0YXJ0Lmxlbmd0aDsgaSsrKVxuXHRcdFx0dG1wTGVhZiA9IHRoaXMuYWRkQ2hpbGQodG1wTGVhZiwgcFBhdHRlcm5TdGFydCwgaSk7XG5cblx0XHR0bXBMZWFmLlBhdHRlcm5TdGFydCA9IHBQYXR0ZXJuU3RhcnQ7XG5cdFx0dG1wTGVhZi5QYXR0ZXJuRW5kID0gKCh0eXBlb2YocFBhdHRlcm5FbmQpID09PSAnc3RyaW5nJykgJiYgKHBQYXR0ZXJuRW5kLmxlbmd0aCA+IDApKSA/IHBQYXR0ZXJuRW5kIDogcFBhdHRlcm5TdGFydDtcblx0XHR0bXBMZWFmLlBhcnNlID0gKHR5cGVvZihwUGFyc2VyKSA9PT0gJ2Z1bmN0aW9uJykgPyBwUGFyc2VyIDogXG5cdFx0XHRcdFx0XHQodHlwZW9mKHBQYXJzZXIpID09PSAnc3RyaW5nJykgPyAoKSA9PiB7IHJldHVybiBwUGFyc2VyOyB9IDpcblx0XHRcdFx0XHRcdChwRGF0YSkgPT4geyByZXR1cm4gcERhdGE7IH07XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmRUcmVlO1xuIl19
