import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { extname, resolve } from 'path';

const COMMENT_PATTERNS = {
  js: { single: '//', multiStart: '/*', multiEnd: '*/' },
  ts: { single: '//', multiStart: '/*', multiEnd: '*/' },
  jsx: { single: '//', multiStart: '/*', multiEnd: '*/' },
  tsx: { single: '//', multiStart: '/*', multiEnd: '*/' },
  py: { single: '#', multiStart: '"""', multiEnd: '"""' },
  rb: { single: '#', multiStart: '=begin', multiEnd: '=end' },
  java: { single: '//', multiStart: '/*', multiEnd: '*/' },
  c: { single: '//', multiStart: '/*', multiEnd: '*/' },
  cpp: { single: '//', multiStart: '/*', multiEnd: '*/' },
  h: { single: '//', multiStart: '/*', multiEnd: '*/' },
  cs: { single: '//', multiStart: '/*', multiEnd: '*/' },
  go: { single: '//', multiStart: '/*', multiEnd: '*/' },
  rs: { single: '//', multiStart: '/*', multiEnd: '*/' },
  php: { single: '//', multiStart: '/*', multiEnd: '*/' },
  swift: { single: '//', multiStart: '/*', multiEnd: '*/' },
  kt: { single: '//', multiStart: '/*', multiEnd: '*/' },
  scala: { single: '//', multiStart: '/*', multiEnd: '*/' },
  sh: { single: '#' },
  bash: { single: '#' },
  zsh: { single: '#' },
  yml: { single: '#' },
  yaml: { single: '#' },
  toml: { single: '#' },
  sql: { single: '--', multiStart: '/*', multiEnd: '*/' },
  html: { multiStart: '<!--', multiEnd: '-->' },
  xml: { multiStart: '<!--', multiEnd: '-->' },
  css: { multiStart: '/*', multiEnd: '*/' },
  scss: { single: '//', multiStart: '/*', multiEnd: '*/' },
  less: { single: '//', multiStart: '/*', multiEnd: '*/' },
  vue: { single: '//', multiStart: '/*', multiEnd: '*/' },
  svelte: { single: '//', multiStart: '/*', multiEnd: '*/' },
};

const LANGUAGE_NAMES = {
  js: 'JavaScript',
  ts: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  py: 'Python',
  rb: 'Ruby',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  h: 'C Header',
  cs: 'C#',
  go: 'Go',
  rs: 'Rust',
  php: 'PHP',
  swift: 'Swift',
  kt: 'Kotlin',
  scala: 'Scala',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  yml: 'YAML',
  yaml: 'YAML',
  toml: 'TOML',
  sql: 'SQL',
  html: 'HTML',
  xml: 'XML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'LESS',
  vue: 'Vue',
  svelte: 'Svelte',
  json: 'JSON',
  md: 'Markdown',
  txt: 'Text',
};

function analyzeFile(content, ext) {
  const lines = content.split('\n');
  const patterns = COMMENT_PATTERNS[ext] || { single: '#' };
  
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  let todos = 0;
  let fixmes = 0;
  let inMultilineComment = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for TODOs and FIXMEs
    const upperLine = line.toUpperCase();
    if (upperLine.includes('TODO')) todos++;
    if (upperLine.includes('FIXME')) fixmes++;
    
    // Blank line
    if (trimmed === '') {
      blankLines++;
      continue;
    }
    
    // Handle multiline comments
    if (patterns.multiStart && patterns.multiEnd) {
      if (inMultilineComment) {
        commentLines++;
        if (trimmed.includes(patterns.multiEnd)) {
          inMultilineComment = false;
        }
        continue;
      }
      
      if (trimmed.startsWith(patterns.multiStart)) {
        commentLines++;
        if (!trimmed.includes(patterns.multiEnd) || trimmed.endsWith(patterns.multiStart)) {
          inMultilineComment = true;
        }
        continue;
      }
    }
    
    // Single line comment
    if (patterns.single && trimmed.startsWith(patterns.single)) {
      commentLines++;
      continue;
    }
    
    codeLines++;
  }
  
  return {
    total: lines.length,
    code: codeLines,
    comments: commentLines,
    blanks: blankLines,
    todos,
    fixmes,
  };
}

export async function countLoc(targetPath, options = {}) {
  const { ignorePatterns = [], extensions = [] } = options;
  const basePath = resolve(targetPath);
  
  const ignoreGlobs = ignorePatterns.map(p => `**/${p}/**`);
  const patterns = extensions.length > 0 
    ? extensions.map(ext => `**/*.${ext}`)
    : ['**/*.*'];
  
  const files = await glob(patterns, {
    cwd: basePath,
    ignore: ignoreGlobs,
    nodir: true,
    absolute: true,
  });
  
  const byLanguage = {};
  const fileDetails = [];
  let totalStats = { files: 0, total: 0, code: 0, comments: 0, blanks: 0, todos: 0, fixmes: 0 };
  
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      const ext = extname(file).slice(1).toLowerCase();
      
      if (!ext) continue;
      
      const stats = analyzeFile(content, ext);
      const langName = LANGUAGE_NAMES[ext] || ext.toUpperCase();
      
      if (!byLanguage[langName]) {
        byLanguage[langName] = { files: 0, total: 0, code: 0, comments: 0, blanks: 0, todos: 0, fixmes: 0 };
      }
      
      byLanguage[langName].files++;
      byLanguage[langName].total += stats.total;
      byLanguage[langName].code += stats.code;
      byLanguage[langName].comments += stats.comments;
      byLanguage[langName].blanks += stats.blanks;
      byLanguage[langName].todos += stats.todos;
      byLanguage[langName].fixmes += stats.fixmes;
      
      totalStats.files++;
      totalStats.total += stats.total;
      totalStats.code += stats.code;
      totalStats.comments += stats.comments;
      totalStats.blanks += stats.blanks;
      totalStats.todos += stats.todos;
      totalStats.fixmes += stats.fixmes;
      
      fileDetails.push({ file: file.replace(basePath, '.'), ext, ...stats });
    } catch (err) {
      // Skip binary or unreadable files
    }
  }
  
  return { byLanguage, totalStats, fileDetails, basePath };
}
