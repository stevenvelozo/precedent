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
		
		var parseString = (pString) =>
		{
			var tmpOutput = '';
			var tmpOutputBuffer = '';
			
			// This holds the currently matching pattern if there is one.
			var tmpPattern = false;
			
			// For sequential pattern matching.
			var tmpPatternMatch = false;
			var tmpPatternMatchOutputBuffer = '';
			
			// Parse a character in the buffer
			var parseCharacter = (pCharacter) =>
			{
				// (1) If we aren't in a pattern match, and we aren't potentially matching, and this may be the start of a new pattern....
				if (!tmpPattern && !tmpPatternMatch && _ParseTree.hasOwnProperty(pCharacter))
				{
					// (1) ... append the character directly to the Pattern Match output Buffer
					tmpPatternMatch = _ParseTree[pCharacter];
					tmpPatternMatchOutputBuffer += pCharacter;
				}
				// (2) If we are in a pattern match (actively seeing if this is part of a new pattern token)
				else if (!tmpPattern && tmpPatternMatch)
				{
					// (2.a) If the pattern has a subpattern with this key
					if (tmpPatternMatch.hasOwnProperty(pCharacter))
					{
						// (2.a) ... traverse another node on the tree.
						tmpPatternMatch = tmpPatternMatch[pCharacter];
					}
					// (2.b) If the pattern has a END we can assume it has a parse function...
					else if (tmpPatternMatch.hasOwnProperty('PatternEnd'))
					{
						// (2.b) ... this is the legitimate start of a pattern.
						tmpPattern = tmpPatternMatch;
						tmpPatternMatch = false;

						// Flush the output buffer.
						tmpOutput += tmpOutputBuffer;
						tmpOutputBuffer = '';

						// Now parse this character (in PATTERN MODE)
						parseCharacter(pCharacter);
					}
					// (2.c) This is a partial pattern start but doesn't actually have a valid end...
					else
					{
						tmpPatternMatch = false;
						tmpOutputBuffer += tmpPatternMatchOutputBuffer;
						tmpPatternMatchOutputBuffer = '';

						// Now parse this character (back in RAW mode)						
						parseCharacter(pCharacter);
					}
				}
				// (3) If we are in a pattern
				else if (tmpPattern)
				{
					// (3) ... append it to the output buffer.
					tmpOutputBuffer += pCharacter;
					// (3.a) ... Check if this is the end of the pattern...
					if ((tmpOutputBuffer.length >= tmpPattern.PatternEnd.length) && 
						(tmpOutputBuffer.substr(-tmpPattern.PatternEnd.length) === tmpPattern.PatternEnd))
					{
						// (3.a) ... ... this is the end of a pattern, cut off the end tag and parse it.
						tmpOutput += tmpPattern.Parse(tmpOutputBuffer.substr(0, tmpOutputBuffer.length - tmpPattern.PatternEnd.length));
						// End pattern mode, clear the output buffer.
						tmpPattern = false;
						tmpOutputBuffer = '';
					}
				}
				// (2) If we aren't in a pattern match or pattern, and this isn't the start of a new pattern (RAW mode)....
				else
				{
					tmpOutputBuffer += pCharacter;
				}
			};
			

			for (var i = 0; i < pString.length; i++)
			{
				// TODO: This is not fast.
				parseCharacter(pString[i]);
			}
			
			tmpOutput += tmpOutputBuffer;
			
			return tmpOutput;
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
