#!/usr/bin/env node

import { program } from 'commander';
import { countLoc } from '../src/counter.js';
import { formatOutput, writeReport } from '../src/output.js';

program
  .name('loc')
  .description('Count lines of code, comments, TODOs, and blanks')
  .version('1.0.0')
  .argument('[path]', 'Path to analyze', '.')
  .option('-o, --output <file>', 'Output report to a text file')
  .option('-i, --ignore <patterns>', 'Comma-separated patterns to ignore', 'node_modules,dist,.git,coverage,build,.next')
  .option('-e, --extensions <exts>', 'Comma-separated file extensions to include', '')
  .option('--json', 'Output as JSON')
  .option('--no-color', 'Disable colored output')
  .action(async (path, options) => {
    try {
      const ignorePatterns = options.ignore.split(',').map(p => p.trim()).filter(Boolean);
      const extensions = options.extensions ? options.extensions.split(',').map(e => e.trim()).filter(Boolean) : [];
      
      const results = await countLoc(path, { ignorePatterns, extensions });
      const output = formatOutput(results, { json: options.json, color: options.color });
      
      console.log(output);
      
      if (options.output) {
        await writeReport(options.output, results);
        console.log(`\nReport saved to: ${options.output}`);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
