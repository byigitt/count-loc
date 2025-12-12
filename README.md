# count-loc

A CLI tool to count lines of code, comments, TODOs, and blanks across your codebase.

## Installation

```bash
npm install -g count-loc
```

Or run locally:

```bash
pnpm install
node bin/cli.js .
```

## Usage

```bash
loc [path] [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <file>` | Output report to a text file | - |
| `-i, --ignore <patterns>` | Comma-separated patterns to ignore | `node_modules,dist,.git,coverage,build,.next` |
| `-e, --extensions <exts>` | Comma-separated file extensions to include | All supported |
| `--json` | Output as JSON | - |
| `--no-color` | Disable colored output | - |

### Examples

```bash
# Analyze current directory
loc

# Analyze specific path
loc ./src

# Only count JavaScript and TypeScript files
loc -e js,ts

# Save report to file
loc -o report.txt

# Output as JSON
loc --json

# Ignore additional directories
loc -i node_modules,dist,vendor
```

## Supported Languages

JavaScript, TypeScript, JSX, TSX, Python, Ruby, Java, C, C++, C#, Go, Rust, PHP, Swift, Kotlin, Scala, Shell, Bash, YAML, TOML, SQL, HTML, XML, CSS, SCSS, LESS, Vue, Svelte, JSON, Markdown, and more.

## Output

The tool provides:
- **Lines of code** - Actual code lines
- **Comments** - Single and multi-line comments
- **Blanks** - Empty lines
- **TODOs** - Lines containing TODO
- **FIXMEs** - Lines containing FIXME

Results are grouped by language with totals.

## Development

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

## License

ISC
