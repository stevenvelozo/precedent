# Precedent

> A zero-dependency meta-templating engine for Node.js and the browser

Define arbitrary delimiter patterns and replace them with strings, computed values, or function output. Precedent powers the `{~...~}` expression system in Pict and the `${...}` environment variable substitution in Fable Settings.

- **Custom Delimiters** -- Register any start/end string pair as a pattern with `addPattern()`
- **Function Handlers** -- Patterns can replace with static strings or call a function with the matched content and a data argument
- **Pattern Precedence** -- A word tree ensures longer delimiters match before shorter ones (`<<EXTRA` before `<<` before `<`)
- **Zero Dependencies** -- No runtime dependencies; under 300 lines of code
- **Browser Ready** -- Includes a browser shim that assigns `window.Precedent`; builds with Quackage

[Quick Start](README.md)
[API Reference](api.md)
[GitHub](https://github.com/stevenvelozo/precedent)
