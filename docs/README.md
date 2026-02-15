# Precedent

A meta-templating engine that parses text strings and replaces delimited regions with custom output. Register start/end delimiter pairs, attach a handler function or replacement string, then parse any text through the engine.

Precedent is the foundation beneath Pict's `{~...~}` template expression system and Fable Settings' `${...}` environment variable substitution. It has zero runtime dependencies and works in both Node.js and the browser.

## Install

```bash
npm install precedent
```

## Quick Start

```javascript
const libPrecedent = require('precedent');
let processor = new libPrecedent();

// Register a pattern: replace anything between << and >> with "REDACTED"
processor.addPattern('<<', '>>', 'REDACTED');

let result = processor.parseString('The code is <<SECRET123>> end.');
// => "The code is REDACTED end."
```

## Core Concepts

### 1. Patterns

A pattern is a pair of delimiter strings (start and end) plus a handler. When the parser encounters the start delimiter in a string, it captures everything until the end delimiter, then calls the handler.

```javascript
processor.addPattern(startDelimiter, endDelimiter, handler);
```

### 2. Handlers

The handler can be:

| Type | Behavior |
|------|----------|
| **string** | The matched region is replaced with this string |
| **function** | Called with `(content, data)` — content between delimiters and the data argument from `parseString()` |
| **omitted** | The content between delimiters is passed through unchanged |

### 3. Data Passing

The second argument to `parseString()` is passed to every handler function as its second parameter:

```javascript
processor.addPattern('{', '}',
	(pContent, pData) =>
	{
		return pData[pContent];
	});

let result = processor.parseString('Hello, {name}!', { name: 'Alice' });
// => "Hello, Alice!"
```

### 4. Pattern Precedence

Patterns are stored in a character-by-character word tree (directed graph). When multiple patterns share a prefix, the longest matching start delimiter wins:

```javascript
processor.addPattern('<', '>', 'SHORT');
processor.addPattern('<<', '>', 'MEDIUM');
processor.addPattern('<<LONG', '>', 'LONG');

processor.parseString('<x>');        // => "SHORT"
processor.parseString('<<x>');       // => "MEDIUM"
processor.parseString('<<LONGx>');   // => "LONG"
```

If a longer match starts but fails to complete, the parser falls back to the shorter match.

## How It Works

```
             addPattern('${', '}', fn)
                       │
                       ▼
┌──────────────────────────────────┐
│  WordTree                        │
│                                  │
│  Builds a character-by-character │
│  tree from start delimiters.     │
│  End delimiters are stored as    │
│  subtrees on the terminal node.  │
│                                  │
│   $ ──▶ { ──▶ PatternEnd ──▶ }  │
│                       └─ Parse() │
└──────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────┐
│  StringParser                    │
│                                  │
│  Scans character by character:   │
│  1. Match start delimiter chars  │
│  2. Buffer content               │
│  3. Match end delimiter chars    │
│  4. Call Parse(content, data)    │
│  5. Replace matched region       │
└──────────────────────────────────┘
```

The parser is stateful and stream-oriented — it processes one character at a time, tracking whether it is in raw mode, matching a start delimiter, buffering content, or matching an end delimiter.

## Architecture

Precedent consists of three classes:

| Class | Responsibility |
|-------|---------------|
| **Precedent** | Public facade — exposes `addPattern()` and `parseString()` |
| **WordTree** | Stores delimiter patterns in a character-based tree structure |
| **StringParser** | Character-by-character parser that traverses the tree and invokes handlers |

## Browser Usage

The browser shim (`Precedent-Browser-Shim.js`) assigns the constructor to `window.Precedent`:

```html
<script src="precedent.min.js"></script>
<script>
	var processor = new Precedent();
	processor.addPattern('{{', '}}', function(content) { return content.toUpperCase(); });
	document.body.innerHTML = processor.parseString('Hello {{world}}');
	// => "Hello WORLD"
</script>
```

Build with Quackage: `npx quack build`

## Where Precedent Is Used

| Consumer | Pattern | Purpose |
|----------|---------|---------|
| **Fable Settings** | `${VAR\|default}` | Environment variable substitution in configuration |
| **Pict** | `{~Prefix:content~}` | 40+ template expression types for data, logic, rendering |
| **Pict Template** | Custom patterns | Base class for all Pict template expressions |
