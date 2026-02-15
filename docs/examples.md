# Usage Patterns

Progressively complex examples showing how to use Precedent's pattern matching in real applications.

---

## Static Replacement

The simplest use: replace every occurrence of a delimited region with a fixed string.

```javascript
const libPrecedent = require('precedent');
let processor = new libPrecedent();

processor.addPattern('<%', '%>', 'REDACTED');

processor.parseString('The API key is <%abc123xyz%> in the config.');
// => "The API key is REDACTED in the config."

processor.parseString('No matches here.');
// => "No matches here."

processor.parseString('A <% first %> and B <% second %> end.');
// => "A REDACTED and B REDACTED end."
```

Every region between `<%` and `%>` is replaced regardless of its content. The content is discarded.

---

## Self-Closing Delimiters

When you pass only a start delimiter and omit the end, the same string is used for both:

```javascript
let processor = new libPrecedent();

processor.addPattern('$');

processor.parseString('Remove the $dollar signs$ from this.');
// => "Remove the dollar signs from this."
```

The `$...$` pair is matched and the content between them passes through (since no handler was provided, the default echoes the content). The dollar signs themselves are stripped.

---

## Content-Processing Functions

Pass a function as the third argument to transform the matched content:

```javascript
let processor = new libPrecedent();

// Count characters between the delimiters
processor.addPattern('<%#', '%>',
	(pContent) =>
	{
		return pContent.length;
	});

processor.parseString('There are <%#0123456789%> digits.');
// => "There are 10 digits."
```

The function receives the text between the delimiters (with delimiters stripped). Whatever it returns becomes the replacement.

### More Transform Examples

```javascript
// Uppercase
processor.addPattern('{upper:', '}',
	(pContent) =>
	{
		return pContent.toUpperCase();
	});

processor.parseString('{upper:hello world}');
// => "HELLO WORLD"

// Reverse
processor.addPattern('{rev:', '}',
	(pContent) =>
	{
		return pContent.split('').reverse().join('');
	});

processor.parseString('{rev:abcde}');
// => "edcba"

// Base64 encode
processor.addPattern('{b64:', '}',
	(pContent) =>
	{
		return Buffer.from(pContent).toString('base64');
	});

processor.parseString('{b64:Hello}');
// => "SGVsbG8="
```

---

## Data Passing

The second argument to `parseString()` is passed to every handler as its second parameter. This is how you inject external data into template processing.

### Simple Data Object

```javascript
let processor = new libPrecedent();

processor.addPattern('{', '}',
	(pContent, pData) =>
	{
		return pData[pContent] || '';
	});

let result = processor.parseString(
	'Dear {name}, your order #{orderId} is ready.',
	{ name: 'Bob', orderId: '12345' }
);
// => "Dear Bob, your order #12345 is ready."
```

### Nested Object Access

```javascript
let processor = new libPrecedent();

processor.addPattern('<^', '^>',
	(pContent, pData) =>
	{
		// Simple dot-notation resolver
		let tmpParts = pContent.split('.');
		let tmpValue = pData;
		for (let i = 0; i < tmpParts.length; i++)
		{
			if (tmpValue && tmpValue.hasOwnProperty(tmpParts[i]))
			{
				tmpValue = tmpValue[tmpParts[i]];
			}
			else
			{
				return '';
			}
		}
		return String(tmpValue);
	});

let data =
{
	User: { Name: 'Alice', Role: 'Admin' },
	App: { Version: '2.1.0' }
};

processor.parseString('Hello <^User.Name^>, you are a <^User.Role^>. App v<^App.Version^>.', data);
// => "Hello Alice, you are a Admin. App v2.1.0."
```

### Scalar Data

The data argument does not have to be an object:

```javascript
let processor = new libPrecedent();

processor.addPattern('<*', '*>',
	(pContent, pData) =>
	{
		return `${pContent}=${pData}`;
	});

processor.parseString('Value: <*x*>', 42);
// => "Value: x=42"
```

---

## Multiple Patterns

A single Precedent instance can hold any number of patterns with different delimiters. Each is matched independently:

```javascript
let processor = new libPrecedent();

// Static replacement
processor.addPattern('<%', '%>', 'JUNKED');

// Character count
processor.addPattern('<%#', '%>',
	(pContent) =>
	{
		return pContent.length;
	});

// Self-closing comment stripper
processor.addPattern('$');

// Data lookup
processor.addPattern('<^', '^>',
	(pContent, pData) =>
	{
		return pData[pContent] || '???';
	});

let result = processor.parseString(
	'Count: <%#12345%>, data: <^key^>, junk: <% removed %>, comment: $gone$',
	{ key: 'found' }
);
// => "Count: 5, data: found, junk: JUNKED, comment: gone"
```

The word tree handles all patterns simultaneously during a single pass through the string.

---

## Pattern Precedence

When multiple patterns share a prefix, the longest match takes priority. If the longer match fails partway through, the parser falls back to the shorter one:

```javascript
let processor = new libPrecedent();

processor.addPattern('<', '>', 'SHORT');
processor.addPattern('<<', '>', 'MEDIUM');
processor.addPattern('<<EXTRALONG', '>', 'LONG');

processor.parseString('<x>');
// => "SHORT"

processor.parseString('<<x>');
// => "MEDIUM"

processor.parseString('<<EXTRALONG>');
// => "LONG"

processor.parseString('<<here>');
// => "MEDIUM"

processor.parseString('<<<<>');
// => "MEDIUM"
// First << matches MEDIUM, then << begins a new match, then > closes it → MEDIUM
```

This behavior is automatic — the word tree disambiguates overlapping prefixes without any explicit priority configuration.

---

## Environment Variable Substitution

This is the real-world pattern used by Fable Settings to inject environment variables into configuration files:

```javascript
let processor = new libPrecedent();

processor.addPattern('${', '}',
	(pTemplateValue) =>
	{
		let tmpValue = pTemplateValue.trim();
		let tmpSeparatorIndex = tmpValue.indexOf('|');

		let tmpDefaultValue = (tmpSeparatorIndex >= 0) ? tmpValue.substring(tmpSeparatorIndex + 1) : '';
		let tmpVarName = (tmpSeparatorIndex > -1) ? tmpValue.substring(0, tmpSeparatorIndex) : tmpValue;

		if (tmpVarName in process.env)
		{
			return process.env[tmpVarName];
		}
		else
		{
			return tmpDefaultValue;
		}
	});
```

### Usage

```javascript
// Real environment variable
processor.parseString('Path is: ${PATH}');
// => "Path is: /usr/local/bin:/usr/bin:..."

// Missing variable with default
processor.parseString('DB host: ${DATABASE_HOST|localhost}');
// => "DB host: localhost"

// Missing variable without default
processor.parseString('Secret: ${MISSING_VAR}');
// => "Secret: "

// Multiple in one string
processor.parseString('${DATABASE_HOST|localhost}:${DATABASE_PORT|5432}');
// => "localhost:5432"
```

The pipe (`|`) separates the variable name from the default value. Whitespace around the variable name is trimmed. This is exactly how Fable Settings processes configuration strings.

---

## Conditional Output

Build a simple conditional by checking the content against the data:

```javascript
let processor = new libPrecedent();

processor.addPattern('{?', '?}',
	(pContent, pData) =>
	{
		// Format: condition|trueOutput|falseOutput
		let tmpParts = pContent.split('|');
		if (tmpParts.length < 3) return '';

		let tmpConditionKey = tmpParts[0].trim();
		let tmpTrueOutput = tmpParts[1];
		let tmpFalseOutput = tmpParts[2];

		return pData[tmpConditionKey] ? tmpTrueOutput : tmpFalseOutput;
	});

processor.parseString('{?loggedIn|Welcome back|Please log in?}', { loggedIn: true });
// => "Welcome back"

processor.parseString('{?loggedIn|Welcome back|Please log in?}', { loggedIn: false });
// => "Please log in"
```

---

## HTML Generation

Use patterns to build HTML from data:

```javascript
let processor = new libPrecedent();

processor.addPattern('{link:', '}',
	(pContent, pData) =>
	{
		// Format: url|text
		let tmpParts = pContent.split('|');
		let tmpUrl = tmpParts[0];
		let tmpText = tmpParts.length > 1 ? tmpParts[1] : tmpUrl;
		return `<a href="${tmpUrl}">${tmpText}</a>`;
	});

processor.addPattern('{img:', '}',
	(pContent) =>
	{
		return `<img src="${pContent}" alt="" />`;
	});

processor.parseString('Visit {link:https://example.com|our site} or see {img:/logo.png}');
// => 'Visit <a href="https://example.com">our site</a> or see <img src="/logo.png" alt="" />'
```

---

## Markdown-Like Syntax

Create lightweight markup that transforms to HTML:

```javascript
let processor = new libPrecedent();

processor.addPattern('**', '**',
	(pContent) =>
	{
		return `<strong>${pContent}</strong>`;
	});

processor.addPattern('__', '__',
	(pContent) =>
	{
		return `<em>${pContent}</em>`;
	});

processor.addPattern('`', '`',
	(pContent) =>
	{
		return `<code>${pContent}</code>`;
	});

processor.parseString('This is **bold** and __italic__ and `code`.');
// => "This is <strong>bold</strong> and <em>italic</em> and <code>code</code>."
```

---

## Composing Multiple Passes

For scenarios where one pass produces patterns that should be processed by a second pass, chain multiple Precedent instances:

```javascript
// First pass: resolve variables
let envProcessor = new libPrecedent();
envProcessor.addPattern('${', '}',
	(pContent) =>
	{
		return process.env[pContent] || '';
	});

// Second pass: format values
let formatProcessor = new libPrecedent();
formatProcessor.addPattern('{upper:', '}',
	(pContent) =>
	{
		return pContent.toUpperCase();
	});

let template = '{upper:${USER}}';
let afterEnv = envProcessor.parseString(template);
// => "{upper:alice}"  (if USER=alice)
let final = formatProcessor.parseString(afterEnv);
// => "ALICE"
```

Each Precedent instance is independent — they do not share patterns or state.

---

## Tips

- **Delimiter choice** — Pick delimiters that do not appear naturally in your text. Multi-character delimiters (like `<%` or `{~`) are safer than single characters.
- **Handler return type** — Handlers must return a string (or a value that coerces to string). Returning `undefined` or `null` produces the string `"undefined"` or `"null"`.
- **No nesting** — Precedent does not support nested patterns of the same type. If `{` is a start delimiter, a `{` inside the content is treated as content, not a new match.
- **Single pass** — Parsing happens in one pass. If a handler's output contains delimiters, they are not re-processed (unless you run a second `parseString()` call).
- **Thread safety** — Instances are not shared state. Create one per context if needed.
