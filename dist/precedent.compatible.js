"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
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
      * Precedent Meta-Templating
      *
      * @license     MIT
      *
      * @author      Steven Velozo <steven@velozo.com>
      *
      * @description Process text streams, parsing out meta-template expressions.
      */
      var libWordTree = require("./WordTree.js");
      var libStringParser = require("./StringParser.js");
      var Precedent = /*#__PURE__*/function () {
        /**
         * Precedent Constructor
         */
        function Precedent() {
          _classCallCheck(this, Precedent);
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
        _createClass(Precedent, [{
          key: "addPattern",
          value: function addPattern(pPatternStart, pPatternEnd, pParser) {
            return this.WordTree.addPattern(pPatternStart, pPatternEnd, pParser);
          }

          /**
           * Parse a string with the existing parse tree
           * @method parseString
           * @param {string} pString - The string to parse
           * @param {object} pData - Data to pass in as the second argument
           * @return {string} The result from the parser
           */
        }, {
          key: "parseString",
          value: function parseString(pString, pData) {
            return this.StringParser.parseString(pString, this.ParseTree, pData);
          }
        }]);
        return Precedent;
      }();
      module.exports = Precedent;
    }, {
      "./StringParser.js": 2,
      "./WordTree.js": 3
    }],
    2: [function (require, module, exports) {
      /**
      * String Parser
      * @author      Steven Velozo <steven@velozo.com>
      * @description Parse a string, properly processing each matched token in the word tree.
      */
      var StringParser = /*#__PURE__*/function () {
        /**
         * StringParser Constructor
         */
        function StringParser() {
          _classCallCheck(this, StringParser);
        }

        /**
         * Create a fresh parsing state object to work with.
         * @method newParserState
         * @param {Object} pParseTree - A node on the parse tree to begin parsing from (usually root)
         * @return {Object} A new parser state object for running a character parser on
         * @private
         */
        _createClass(StringParser, [{
          key: "newParserState",
          value: function newParserState(pParseTree) {
            return {
              ParseTree: pParseTree,
              Asynchronous: false,
              Output: '',
              OutputBuffer: '',
              Pattern: {},
              PatternMatch: false,
              PatternMatchEnd: false
            };
          }

          /**
           * Append a character to the output buffer in the parser state.
           * This output buffer is used when a potential match is being explored, or a match is being explored.
           * @method appendOutputBuffer
           * @param {string} pCharacter - The character to append
           * @param {Object} pParserState - The state object for the current parsing task
           * @private
           */
        }, {
          key: "appendOutputBuffer",
          value: function appendOutputBuffer(pCharacter, pParserState) {
            pParserState.OutputBuffer += pCharacter;
          }

          /**
           * Flush the output buffer to the output and clear it.
           * @method flushOutputBuffer
           * @param {Object} pParserState - The state object for the current parsing task
           * @private
           */
        }, {
          key: "flushOutputBuffer",
          value: function flushOutputBuffer(pParserState) {
            pParserState.Output += pParserState.OutputBuffer;
            pParserState.OutputBuffer = '';
          }
        }, {
          key: "resetOutputBuffer",
          value: function resetOutputBuffer(pParserState) {
            // Flush the output buffer.
            this.flushOutputBuffer(pParserState);
            // End pattern mode
            pParserState.Pattern = false;
            pParserState.PatternStartNode = false;
            pParserState.StartPatternMatchComplete = false;
            pParserState.EndPatternMatchBegan = false;
            pParserState.PatternMatch = false;
            return true;
          }

          /**
           * Parse a character in the buffer.
           * @method parseCharacter
           * @param {string} pCharacter - The character to append
           * @param {Object} pParserState - The state object for the current parsing task
           * @private
           */
        }, {
          key: "parseCharacter",
          value: function parseCharacter(pCharacter, pParserState, pData) {
            // If we are already in a pattern match traversal
            if (pParserState.PatternMatch) {
              // If the pattern is still matching the start and we haven't passed the buffer
              if (!pParserState.StartPatternMatchComplete && pParserState.Pattern.hasOwnProperty(pCharacter)) {
                pParserState.Pattern = pParserState.Pattern[pCharacter];
                this.appendOutputBuffer(pCharacter, pParserState);
              } else if (pParserState.EndPatternMatchBegan) {
                if (pParserState.Pattern.PatternEnd.hasOwnProperty(pCharacter)) {
                  // This leaf has a PatternEnd tree, so we will wait until that end is met.
                  pParserState.Pattern = pParserState.Pattern.PatternEnd[pCharacter];
                  // Flush the output buffer.
                  this.appendOutputBuffer(pCharacter, pParserState);
                  // If this last character is the end of the pattern, parse it.
                  if (pParserState.Pattern.hasOwnProperty('Parse')) {
                    // Run the function
                    pParserState.OutputBuffer = pParserState.Pattern.Parse(pParserState.OutputBuffer.substr(pParserState.Pattern.PatternStartString.length, pParserState.OutputBuffer.length - (pParserState.Pattern.PatternStartString.length + pParserState.Pattern.PatternEndString.length)), pData);
                    return this.resetOutputBuffer(pParserState);
                  }
                } else if (pParserState.PatternStartNode.PatternEnd.hasOwnProperty(pCharacter)) {
                  // We broke out of the end -- see if this is a new start of the end.
                  pParserState.Pattern = pParserState.PatternStartNode.PatternEnd[pCharacter];
                  this.appendOutputBuffer(pCharacter, pParserState);
                } else {
                  pParserState.EndPatternMatchBegan = false;
                  this.appendOutputBuffer(pCharacter, pParserState);
                }
              } else if (pParserState.Pattern.hasOwnProperty('PatternEnd')) {
                if (!pParserState.StartPatternMatchComplete) {
                  pParserState.StartPatternMatchComplete = true;
                  pParserState.PatternStartNode = pParserState.Pattern;
                }
                this.appendOutputBuffer(pCharacter, pParserState);
                if (pParserState.Pattern.PatternEnd.hasOwnProperty(pCharacter)) {
                  // This is the first character of the end pattern.
                  pParserState.EndPatternMatchBegan = true;
                  // This leaf has a PatternEnd tree, so we will wait until that end is met.
                  pParserState.Pattern = pParserState.Pattern.PatternEnd[pCharacter];
                  // If this last character is the end of the pattern, parse it.
                  if (pParserState.Pattern.hasOwnProperty('Parse')) {
                    // Run the t*mplate function
                    pParserState.OutputBuffer = pParserState.Pattern.Parse(pParserState.OutputBuffer.substr(pParserState.Pattern.PatternStartString.length, pParserState.OutputBuffer.length - (pParserState.Pattern.PatternStartString.length + pParserState.Pattern.PatternEndString.length)), pData);
                    return this.resetOutputBuffer(pParserState);
                  }
                }
              } else {
                // We are in a pattern start but didn't match one; reset and start trying again from this character.
                this.resetOutputBuffer(pParserState);
              }
            }
            // If we aren't in a pattern match or pattern, and this isn't the start of a new pattern (RAW mode)....
            if (!pParserState.PatternMatch) {
              // This may be the start of a new pattern....
              if (pParserState.ParseTree.hasOwnProperty(pCharacter)) {
                // ... assign the root node as the matched node.
                this.resetOutputBuffer(pParserState);
                this.appendOutputBuffer(pCharacter, pParserState);
                pParserState.Pattern = pParserState.ParseTree[pCharacter];
                pParserState.PatternMatch = true;
                return true;
              } else {
                this.appendOutputBuffer(pCharacter, pParserState);
              }
            }
            return false;
          }

          /**
           * Parse a string for matches, and process any template segments that occur.
           * @method parseString
           * @param {string} pString - The string to parse.
           * @param {Object} pParseTree - The parse tree to begin parsing from (usually root)
           * @param {Object} pData - The data to pass to the function as a second parameter
           */
        }, {
          key: "parseString",
          value: function parseString(pString, pParseTree, pData) {
            var tmpParserState = this.newParserState(pParseTree);
            for (var i = 0; i < pString.length; i++) {
              this.parseCharacter(pString[i], tmpParserState, pData);
            }
            this.flushOutputBuffer(tmpParserState);
            return tmpParserState.Output;
          }
        }]);
        return StringParser;
      }();
      module.exports = StringParser;
    }, {}],
    3: [function (require, module, exports) {
      /**
      * Word Tree
      * @author      Steven Velozo <steven@velozo.com>
      * @description Create a tree (directed graph) of Javascript objects, one character per object.
      */
      var WordTree = /*#__PURE__*/function () {
        /**
         * WordTree Constructor
         */
        function WordTree() {
          _classCallCheck(this, WordTree);
          this.ParseTree = {};
        }

        /**
         * Add a child character to a Parse Tree node
         * @method addChild
         * @param {Object} pTree - A parse tree to push the characters into
         * @param {string} pPattern - The string to add to the tree
         * @returns {Object} The resulting leaf node that was added (or found)
         * @private
         */
        _createClass(WordTree, [{
          key: "addChild",
          value: function addChild(pTree, pPattern) {
            if (!pTree.hasOwnProperty(pPattern)) {
              pTree[pPattern] = {};
            }
            return pTree[pPattern];
          }

          /**
           * Add a child character to a Parse Tree PatternEnd subtree
           * @method addChild
           * @param {Object} pTree - A parse tree to push the characters into
           * @param {string} pPattern - The string to add to the tree
           * @returns {Object} The resulting leaf node that was added (or found)
           * @private
           */
        }, {
          key: "addEndChild",
          value: function addEndChild(pTree, pPattern) {
            if (!pTree.hasOwnProperty('PatternEnd')) {
              pTree.PatternEnd = {};
            }
            pTree.PatternEnd[pPattern] = {};
            return pTree.PatternEnd[pPattern];
          }

          /** Add a Pattern to the Parse Tree
           * @method addPattern
           * @param {Object} pPatternStart - The starting string for the pattern (e.g. "${")
           * @param {string} pPatternEnd - The ending string for the pattern (e.g. "}")
           * @param {function} fParser - The function to parse if this is the matched pattern, once the Pattern End is met.  If this is a string, a simple replacement occurs.
           * @return {bool} True if adding the pattern was successful
           */
        }, {
          key: "addPattern",
          value: function addPattern(pPatternStart, pPatternEnd, fParser) {
            if (pPatternStart.length < 1) {
              return false;
            }
            if (typeof pPatternEnd === 'string' && pPatternEnd.length < 1) {
              return false;
            }
            var tmpLeaf = this.ParseTree;

            // Add the tree of leaves iteratively
            for (var i = 0; i < pPatternStart.length; i++) {
              tmpLeaf = this.addChild(tmpLeaf, pPatternStart[i], i);
            }
            if (!tmpLeaf.hasOwnProperty('PatternEnd')) {
              tmpLeaf.PatternEnd = {};
            }
            var tmpPatternEnd = typeof pPatternEnd === 'string' ? pPatternEnd : pPatternStart;
            for (var _i = 0; _i < tmpPatternEnd.length; _i++) {
              tmpLeaf = this.addEndChild(tmpLeaf, tmpPatternEnd[_i], _i);
            }
            tmpLeaf.PatternStartString = pPatternStart;
            tmpLeaf.PatternEndString = tmpPatternEnd;
            tmpLeaf.Parse = typeof fParser === 'function' ? fParser : typeof fParser === 'string' ? function () {
              return fParser;
            } : function (pData) {
              return pData;
            };
            return true;
          }
        }]);
        return WordTree;
      }();
      module.exports = WordTree;
    }, {}]
  }, {}, [1])(1);
});