(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.Precedent = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      /**
      * Simple browser shim loader - assign the npm module to a window global automatically
      *
      * @author <steven@velozo.com>
      */
      var libNPMModuleWrapper = require('./Precedent.js');
      if (typeof window == 'object' && !window.hasOwnProperty('Precedent')) {
        window.Precedent = libNPMModuleWrapper;
      }
      module.exports = libNPMModuleWrapper;
    }, {
      "./Precedent.js": 2
    }],
    2: [function (require, module, exports) {
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
      class Precedent {
        /**
         * Precedent Constructor
         */
        constructor() {
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
        addPattern(pPatternStart, pPatternEnd, pParser) {
          return this.WordTree.addPattern(pPatternStart, pPatternEnd, pParser);
        }

        /**
         * Parse a string with the existing parse tree
         * @method parseString
         * @param {string} pString - The string to parse
         * @param {object} pData - Data to pass in as the second argument
         * @return {string} The result from the parser
         */
        parseString(pString, pData) {
          return this.StringParser.parseString(pString, this.ParseTree, pData);
        }
      }
      module.exports = Precedent;
    }, {
      "./StringParser.js": 3,
      "./WordTree.js": 4
    }],
    3: [function (require, module, exports) {
      /**
      * String Parser
      * @author      Steven Velozo <steven@velozo.com>
      * @description Parse a string, properly processing each matched token in the word tree.
      */

      class StringParser {
        /**
         * StringParser Constructor
         */
        constructor() {}

        /**
         * Create a fresh parsing state object to work with.
         * @method newParserState
         * @param {Object} pParseTree - A node on the parse tree to begin parsing from (usually root)
         * @return {Object} A new parser state object for running a character parser on
         * @private
         */
        newParserState(pParseTree) {
          return {
            ParseTree: pParseTree,
            Asynchronous: false,
            Output: '',
            OutputBuffer: '',
            Pattern: false,
            PatternMatch: false,
            PatternMatchOutputBuffer: ''
          };
        }

        /**
         * Assign a node of the parser tree to be the next potential match.
         * If the node has a PatternEnd property, it is a valid match and supercedes the last valid match (or becomes the initial match).
         * @method assignNode
         * @param {Object} pNode - A node on the parse tree to assign
         * @param {Object} pParserState - The state object for the current parsing task
         * @private
         */
        assignNode(pNode, pParserState) {
          pParserState.PatternMatch = pNode;

          // If the pattern has a END we can assume it has a parse function...
          if (pParserState.PatternMatch.hasOwnProperty('PatternEnd')) {
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
        appendOutputBuffer(pCharacter, pParserState) {
          pParserState.OutputBuffer += pCharacter;
        }

        /**
         * Flush the output buffer to the output and clear it.
         * @method flushOutputBuffer
         * @param {Object} pParserState - The state object for the current parsing task
         * @private
         */
        flushOutputBuffer(pParserState) {
          pParserState.Output += pParserState.OutputBuffer;
          pParserState.OutputBuffer = '';
        }

        /**
         * Check if the pattern has ended.  If it has, properly flush the buffer and start looking for new patterns.
         * @method checkPatternEnd
         * @param {Object} pParserState - The state object for the current parsing task
         * @private
         */
        checkPatternEnd(pParserState, pData) {
          if (pParserState.OutputBuffer.length >= pParserState.Pattern.PatternEnd.length + pParserState.Pattern.PatternStart.length && pParserState.OutputBuffer.substr(-pParserState.Pattern.PatternEnd.length) === pParserState.Pattern.PatternEnd) {
            // ... this is the end of a pattern, cut off the end tag and parse it.
            // Trim the start and end tags off the output buffer now
            pParserState.OutputBuffer = pParserState.Pattern.Parse(pParserState.OutputBuffer.substr(pParserState.Pattern.PatternStart.length, pParserState.OutputBuffer.length - (pParserState.Pattern.PatternStart.length + pParserState.Pattern.PatternEnd.length)), pData);
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
        parseCharacter(pCharacter, pParserState, pData) {
          // (1) If we aren't in a pattern match, and we aren't potentially matching, and this may be the start of a new pattern....
          if (!pParserState.PatternMatch && pParserState.ParseTree.hasOwnProperty(pCharacter)) {
            // ... assign the node as the matched node.
            this.assignNode(pParserState.ParseTree[pCharacter], pParserState);
            this.appendOutputBuffer(pCharacter, pParserState);
          }
          // (2) If we are in a pattern match (actively seeing if this is part of a new pattern token)
          else if (pParserState.PatternMatch) {
            // If the pattern has a subpattern with this key
            if (pParserState.PatternMatch.hasOwnProperty(pCharacter)) {
              // Continue matching patterns.
              this.assignNode(pParserState.PatternMatch[pCharacter], pParserState);
            }
            this.appendOutputBuffer(pCharacter, pParserState);
            if (pParserState.Pattern) {
              // ... Check if this is the end of the pattern (if we are matching a valid pattern)...
              this.checkPatternEnd(pParserState, pData);
            }
          }
          // (3) If we aren't in a pattern match or pattern, and this isn't the start of a new pattern (RAW mode)....
          else {
            pParserState.Output += pCharacter;
          }
        }

        /**
         * Parse a string for matches, and process any template segments that occur.
         * @method parseString
         * @param {string} pString - The string to parse.
         * @param {Object} pParseTree - The parse tree to begin parsing from (usually root)
         * @param {Object} pData - The data to pass to the function as a second parameter
         */
        parseString(pString, pParseTree, pData) {
          let tmpParserState = this.newParserState(pParseTree);
          for (var i = 0; i < pString.length; i++) {
            this.parseCharacter(pString[i], tmpParserState, pData);
          }
          this.flushOutputBuffer(tmpParserState);
          return tmpParserState.Output;
        }
      }
      module.exports = StringParser;
    }, {}],
    4: [function (require, module, exports) {
      /**
      * Word Tree
      * @author      Steven Velozo <steven@velozo.com>
      * @description Create a tree (directed graph) of Javascript objects, one character per object.
      */

      class WordTree {
        /**
         * WordTree Constructor
         */
        constructor() {
          this.ParseTree = {};
        }

        /**
         * Add a child character to a Parse Tree node
         * @method addChild
         * @param {Object} pTree - A parse tree to push the characters into
         * @param {string} pPattern - The string to add to the tree
         * @param {number} pIndex - The index of the character in the pattern
         * @returns {Object} The resulting leaf node that was added (or found)
         * @private
         */
        addChild(pTree, pPattern, pIndex) {
          if (!pTree.hasOwnProperty(pPattern[pIndex])) pTree[pPattern[pIndex]] = {};
          return pTree[pPattern[pIndex]];
        }

        /** Add a Pattern to the Parse Tree
         * @method addPattern
         * @param {Object} pPatternStart - The starting string for the pattern (e.g. "${")
         * @param {string} pPatternEnd - The ending string for the pattern (e.g. "}")
         * @param {number} pParser - The function to parse if this is the matched pattern, once the Pattern End is met.  If this is a string, a simple replacement occurs.
         * @return {bool} True if adding the pattern was successful
         */
        addPattern(pPatternStart, pPatternEnd, pParser) {
          if (pPatternStart.length < 1) return false;
          if (typeof pPatternEnd === 'string' && pPatternEnd.length < 1) return false;
          let tmpLeaf = this.ParseTree;

          // Add the tree of leaves iteratively
          for (var i = 0; i < pPatternStart.length; i++) tmpLeaf = this.addChild(tmpLeaf, pPatternStart, i);
          tmpLeaf.PatternStart = pPatternStart;
          tmpLeaf.PatternEnd = typeof pPatternEnd === 'string' && pPatternEnd.length > 0 ? pPatternEnd : pPatternStart;
          tmpLeaf.Parse = typeof pParser === 'function' ? pParser : typeof pParser === 'string' ? () => {
            return pParser;
          } : pData => {
            return pData;
          };
          return true;
        }
      }
      module.exports = WordTree;
    }, {}]
  }, {}, [1])(1);
});