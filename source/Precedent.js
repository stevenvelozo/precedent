/**
* Precedent Meta-Templating
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Process text streams, parsing out meta-template expressions.
*/
var Precedent = function()
{
	function createNew(pSettings)
	{
		var _ParseTree = {};
		
		var addChild = (pTree, pPattern, pIndex) =>
		{
			if (pIndex > pPattern.length)
				return pTree;
			
			if (!pTree.hasOwnProperty(pPattern[pIndex]))
				pTree[pPattern[pIndex]] = {};
			
			return pTree[pPattern[pIndex]];
		};
		
		var addPattern = (pPatternStart, pPatternEnd, pParser) =>
		{
			if (pPatternStart.length < 1)
				return false;

			var _Leaf = _ParseTree;

			// Add the tree of leaves
			for (var i = 0; i < pPatternStart.length; i++)
				_Leaf = addChild(_Leaf, pPatternStart, i);

			_Leaf.PatternStart = pPatternStart;
			_Leaf.PatternEnd = ((typeof(pPatternEnd) === 'string') && (pPatternEnd.length > 0)) ? pPatternEnd : pPatternStart;
			_Leaf.Parse = (typeof(pParser) === 'function') ? pParser : 
							(typeof(pParser) === 'string') ? () => { return pParser; } :
							(pData) => { return pData; };

			return true;
		};

		var newParserState = () =>
		{
			return (
			{
				Output: '',
				OutputBuffer: '',

				Pattern: false,

				PatternMatch: false,
				PatternMatchOutputBuffer: ''
			});
		};
		
		// Assign a node as a possible parser state.  If it is a valid complete closure, assign it as the current pattern.
		var assignNode = (pNode, pParserState) =>
		{
			pParserState.PatternMatch = pNode;

			// If the pattern has a END we can assume it has a parse function...
			if (pParserState.PatternMatch.hasOwnProperty('PatternEnd'))
			{
				// ... this is the legitimate start of a pattern.
				pParserState.Pattern = pParserState.PatternMatch;
			}
		};
		
		var appendOutputBuffer = (pCharacter, pParserState) =>
		{
			pParserState.OutputBuffer += pCharacter;
		};
		
		var flushOutputBuffer = (pParserState) =>
		{
			pParserState.Output += pParserState.OutputBuffer;
			pParserState.OutputBuffer = '';
		};
		
		var checkPatternEnd = (pParserState) =>
		{
			if ((pParserState.OutputBuffer.length >= pParserState.Pattern.PatternEnd.length+pParserState.Pattern.PatternStart.length) && 
				(pParserState.OutputBuffer.substr(-pParserState.Pattern.PatternEnd.length) === pParserState.Pattern.PatternEnd))
			{
				// ... this is the end of a pattern, cut off the end tag and parse it.
				// Trim the start adn end tags off the output buffer now
				pParserState.OutputBuffer = pParserState.Pattern.Parse(pParserState.OutputBuffer.substr(pParserState.Pattern.PatternStart.length, pParserState.OutputBuffer.length - (pParserState.Pattern.PatternStart.length+pParserState.Pattern.PatternEnd.length)));
				// Flush the output buffer.
				flushOutputBuffer(pParserState);
				// End pattern mode
				pParserState.Pattern = false;
				pParserState.PatternMatch = false;
			}
		};
		
		// Parse a character in the buffer
		var parseCharacter = (pCharacter, pParserState) =>
		{
			// (1) If we aren't in a pattern match, and we aren't potentially matching, and this may be the start of a new pattern....
			if (!pParserState.PatternMatch && _ParseTree.hasOwnProperty(pCharacter))
			{
				// ... assign the node as the matched node.
				assignNode(_ParseTree[pCharacter], pParserState);
				appendOutputBuffer(pCharacter, pParserState);
			}
			// (2) If we are in a pattern match (actively seeing if this is part of a new pattern token)
			else if (pParserState.PatternMatch)
			{
				// If the pattern has a subpattern with this key
				if (pParserState.PatternMatch.hasOwnProperty(pCharacter))
				{
					// Continue matching patterns.
					assignNode(pParserState.PatternMatch[pCharacter], pParserState);
				}
				appendOutputBuffer(pCharacter, pParserState);
				if (pParserState.Pattern)
				{
					// ... Check if this is the end of the pattern (if we are matching a valid pattern)...
					checkPatternEnd(pParserState);
				}
			}
			// (3) If we aren't in a pattern match or pattern, and this isn't the start of a new pattern (RAW mode)....
			else
			{
				pParserState.Output += pCharacter;
			}
		};

		var parseString = (pString) =>
		{
			var tmpParserState = newParserState();
			

			for (var i = 0; i < pString.length; i++)
			{
				// TODO: This is not fast.
				parseCharacter(pString[i], tmpParserState);
			}
			
			flushOutputBuffer(tmpParserState);
			
			return tmpParserState.Output;
		};

		var oPrecedent = (
			{
				tree: _ParseTree,

				addPattern: addPattern,
				
				parseString: parseString
			});

		return oPrecedent;
	}

	return {new: createNew};
};

module.exports = new Precedent();
