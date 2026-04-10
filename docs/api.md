# API Reference

## Class: Precedent

The main public interface. Creates a WordTree for pattern storage and a StringParser for execution.

### Constructor

```javascript
const libPrecedent = require('precedent');
let processor = new libPrecedent();
```

No parameters. The constructor initializes an empty parse tree.

---

## Properties

### ParseTree

The root node of the internal word tree. This is the directed graph that stores all registered patterns as character-by-character paths.

**Type:** `object`

Inspect it to see the current tree structure:

```javascript
processor.addPattern('${', '}', myHandler);
console.log(JSON.stringify(processor.ParseTree, null, 2));
```

### WordTree

The WordTree instance that manages pattern storage.

**Type:** `WordTree`

### StringParser

The StringParser instance that executes pattern matching.

**Type:** `StringParser`

---

## Methods

### addPattern(pPatternStart, pPatternEnd, pParser)

Register a delimiter pair and a handler with the parse tree.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pPatternStart` | string | Yes | The opening delimiter (e.g. `'${'`, `'<%'`, `'<'`) |
| `pPatternEnd` | string | No | The closing delimiter (e.g. `'}'`, `'%>'`, `'>'`). If omitted, defaults to `pPatternStart` |
| `pParser` | string \| function | No | The handler (see below) |

**Returns:** `boolean` -- `true` if the pattern was added, `false` if the start or end delimiter was empty.

#### Handler Types

**String handler** -- Replace the matched region with this literal string:

```javascript
processor.addPattern('<%', '%>', 'REPLACED');
processor.parseString('A <%stuff%> B');
// => "A REPLACED B"
```

**Function handler** -- Called with two arguments:

| Argument | Description |
|----------|-------------|
| `pContent` | The text between the start and end delimiters (delimiters stripped) |
| `pData` | The second argument passed to `parseString()` |

```javascript
processor.addPattern('<%#', '%>',
	(pContent, pData) =>
	{
		return pContent.length;
	});

processor.parseString('Count: <%#ABCDE%>');
// => "Count: 5"
```

**No handler** -- The content between delimiters is passed through (delimiters are stripped):

```javascript
processor.addPattern('$');
processor.parseString('A $comment$ B');
// => "A comment B"
```

#### Self-Closing Patterns

When only `pPatternStart` is provided (no end delimiter), the start string is used as both the opening and closing delimiter:

```javascript
processor.addPattern('$');
// Equivalent to: processor.addPattern('$', '$')

processor.parseString('Hello $World$ Goodbye');
// => "Hello World Goodbye"
```

---

### parseString(pString, pData)

Parse a string against all registered patterns, replacing matched regions with handler output.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pString` | string | Yes | The text to parse |
| `pData` | any | No | Passed as the second argument to every function handler |

**Returns:** `string` -- The processed string with all matched patterns replaced.

```javascript
processor.addPattern('{', '}',
	(pContent, pData) =>
	{
		return pData[pContent] || pContent;
	});

let result = processor.parseString(
	'Hello {name}, welcome to {place}.',
	{ name: 'Alice', place: 'Wonderland' }
);
// => "Hello Alice, welcome to Wonderland."
```

If no patterns match, the input string is returned unchanged.

---

## Class: WordTree

Builds and maintains the internal directed graph for pattern matching. You rarely interact with this directly -- `Precedent.addPattern()` delegates to it.

### addPattern(pPatternStart, pPatternEnd, fParser)

Adds a pattern to the tree. Each character of the start delimiter becomes a node. The end delimiter is stored as a subtree (`PatternEnd`) on the terminal start node. The handler function is stored on the terminal end node as `Parse`.

**Returns:** `boolean`

### Tree Structure

For `addPattern('${', '}', fn)`, the tree looks like:

```
ParseTree
  └── '$'
       └── '{'
            └── PatternEnd
                 └── '}'
                      ├── PatternStartString: '${'
                      ├── PatternEndString: '}'
                      └── Parse: fn
```

Multiple patterns sharing a prefix character (e.g. `<`, `<<`, `<<LONG`) branch naturally within the tree, enabling longest-match-first behavior.

---

## Class: StringParser

Character-by-character parser that traverses the WordTree and executes handler functions. You rarely interact with this directly -- `Precedent.parseString()` delegates to it.

### parseString(pString, pParseTree, pData)

Scans the input string one character at a time, maintaining a state object that tracks:

| State Property | Purpose |
|---------------|---------|
| `Output` | Accumulated final output |
| `OutputBuffer` | Characters being buffered during a potential match |
| `Pattern` | Current node in the word tree |
| `PatternMatch` | Whether we are currently in a pattern match |
| `StartPatternMatchComplete` | Whether the full start delimiter has been matched |
| `EndPatternMatchBegan` | Whether end delimiter matching has started |

### Parsing Flow

1. **Raw mode** -- Characters are buffered directly to output
2. **Start match** -- A character matches the tree root; parser begins traversing the tree
3. **Content capture** -- Start delimiter fully matched; characters are buffered as content
4. **End match** -- End delimiter characters begin matching the PatternEnd subtree
5. **Execution** -- End delimiter fully matched; handler is called with `(content, data)`
6. **Replacement** -- Handler output replaces the entire matched region (delimiters + content)
7. **Reset** -- Parser returns to raw mode

If a partial start match fails (the next character does not continue the tree path), the buffered characters are flushed as-is and the parser resets to raw mode.

---

## Error Handling

| Condition | Behavior |
|-----------|----------|
| Empty start delimiter | `addPattern()` returns `false` |
| Empty end delimiter | `addPattern()` returns `false` |
| Empty input string | `parseString()` returns `''` |
| No matching patterns | Input is returned unchanged |
| Unmatched start delimiter | Start delimiter characters pass through as-is |
| Nested start delimiters | Inner start is treated as content, not a new match |
