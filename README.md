# Precedent

A meta-templating engine for processing text streams with pattern-based template expressions. Define start/end pattern markers with string or function parsers, and Precedent handles nested pattern resolution automatically.

[![Coverage Status](https://coveralls.io/repos/github/stevenvelozo/precedent/badge.svg?branch=master)](https://coveralls.io/github/stevenvelozo/precedent?branch=master)
[![Build Status](https://github.com/stevenvelozo/precedent/workflows/Precedent/badge.svg)](https://github.com/stevenvelozo/precedent/actions)
[![npm version](https://badge.fury.io/js/precedent.svg)](https://badge.fury.io/js/precedent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- **Pattern-Based Parsing** - Define start/end markers to identify template regions in text
- **String or Function Parsers** - Replace patterns with static strings or dynamic function output
- **Nested Pattern Support** - Overlapping pattern prefixes (e.g. `<%`, `<%=`, `<$$`) resolve correctly in a single pass
- **Word Tree Architecture** - Patterns are stored in a tree structure for efficient matching
- **Data Passing** - Pass a data object through to parser functions for context-aware rendering
- **Browser Compatible** - Works in both Node.js and browser environments
- **Zero Dependencies** - No external runtime dependencies

## Installation

```bash
npm install precedent
```

## Quick Start

```javascript
const Precedent = require('precedent');

const precedent = new Precedent();

// Add a simple string substitution pattern
precedent.addPattern('{Name', '}', 'David Bowie');

// Parse a string containing the pattern
precedent.parseString('Hello, {Name}!');
// => "Hello, David Bowie!"
```

## Usage

### String Substitution

Replace patterns with a fixed string value. Content between the start and end markers is ignored:

```javascript
const precedent = new Precedent();

precedent.addPattern('{Name', '}', 'David Bowie');

precedent.parseString('A message for {Name}.');
// => "A message for David Bowie."

// Content between markers is ignored for string substitutions
precedent.parseString('A message for {Name IGNORED TEXT}.');
// => "A message for David Bowie."
```

### Function-Based Parsing

Pass a function as the parser to dynamically process the content between markers:

```javascript
const precedent = new Precedent();

precedent.addPattern('{Length', '}', (pString) => { return pString.length; });

precedent.parseString('The length is {Length some text}.');
// => "The length is  some text."  (length of " some text")
```

### Passing Data to Parsers

A data object can be passed as the second argument to `parseString`, which is then available to parser functions:

```javascript
const precedent = new Precedent();

precedent.addPattern('<%=', '%>', (pContent, pData) =>
{
	return pData[pContent.trim()] || '';
});

precedent.parseString('Hello, <%= username %>!', { username: 'Steven' });
// => "Hello, Steven!"
```

## API

### `addPattern(patternStart, patternEnd, parser)`

Add a pattern to the parse tree.

| Parameter | Type | Description |
|-----------|------|-------------|
| `patternStart` | `String` | The opening marker for the pattern |
| `patternEnd` | `String` | The closing marker for the pattern |
| `parser` | `String` or `Function` | Replacement string, or function receiving `(content, data)` |

Returns `true` if the pattern was added successfully.

### `parseString(contentString, data)`

Parse a string against all registered patterns.

| Parameter | Type | Description |
|-----------|------|-------------|
| `contentString` | `String` | The text to parse |
| `data` | `Object` | Optional data object passed to parser functions |

Returns the parsed string.

## Part of the Retold Framework

Precedent is used throughout the Fable ecosystem for template processing:

- [fable](https://github.com/stevenvelozo/fable) - Application services framework
- [pict](https://github.com/stevenvelozo/pict) - UI framework
- [pict-template](https://github.com/stevenvelozo/pict-template) - Template engine built on Precedent

## Testing

Run the test suite:

```bash
npm test
```

Run with coverage:

```bash
npm run coverage
```

## License

MIT - See [LICENSE](LICENSE) for details.

## Author

Steven Velozo - [steven@velozo.com](mailto:steven@velozo.com)
