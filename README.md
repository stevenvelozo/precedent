# Precedent
Precedent meta-templating engine, for when you want templates ... for templates.

[![Code Climate](https://codeclimate.com/github/stevenvelozo/precedent/badges/gpa.svg)](https://codeclimate.com/github/stevenvelozo/precedent) [![Coverage Status](https://coveralls.io/repos/stevenvelozo/precedent/badge.svg?branch=master)](https://coveralls.io/r/stevenvelozo/precedent?branch=master) [![Build Status](https://travis-ci.org/stevenvelozo/precedent.svg?branch=master)](https://travis-ci.org/stevenvelozo/precedent) [![Dependency Status](https://david-dm.org/stevenvelozo/precedent.svg)](https://david-dm.org/stevenvelozo/precedent) [![devDependency Status](https://david-dm.org/stevenvelozo/precedent/dev-status.svg)](https://david-dm.org/stevenvelozo/precedent#info=devDependencies)

## Template Patterns

Precedent works on the concept of "Template Patterns".  These are regions of text that are replaced by their template function.  Because patterns are defined in a tree data structure, nested patterns (such as `<%`, `<%=`, `<$$` and `<`) properly get parsed in the same process run.

So, for instance, you could create a pattern like so:


```js
// Load the precedent library
var libPrecedent = require('../source/Precedent.js').new();

// Add the pattern
libPrecedent.addPattern('{Name', '}', 'David Bowie');

// Parse a string with the pattern
console.log(libPrecedent.parseString('This is just a short message for {Name}.');
// Anything inbetween the start and end is ignored in this case, since it is a string substitution.
console.log(libPrecedent.parseString('This is just a short message for {Name THIS TEXT IS IGNORED}.  We hope to ignore the previous text.');
```

This would output the following to the console:

```
This is just a short message for David Bowie.
This is just a short message for David Bowie.  We hope to ignore the previous text.
```

### precedent.addPattern(patternStart, patternEnd, parser)

Add a pattern to the string processor.

```javascript
// Pass in a string
libPrecedent.addPattern('{Name', '}', 'David Bowie');

// Or a function
libPrecedent.addPattern('{Name', '}', (pString)=>{return pString.length;});
```

Each time a pattern is matched, anything between the `patternStart` and `patternEnd` will be passed into the parse function.

#### patternStart
Type: `String`

The beginning portion of a pattern.

#### patternEnd
Type: `String`

The ending portion of a pattern.

##### parser
Type: `String` or `Function`
Default: Echo content between the pattern start and end.
