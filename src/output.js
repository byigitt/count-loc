import { writeFile } from 'fs/promises';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function colorize(text, color, useColor = true) {
  if (!useColor) return text;
  return `${COLORS[color] || ''}${text}${COLORS.reset}`;
}

function padRight(str, len) {
  return str.toString().padEnd(len);
}

function padLeft(str, len) {
  return str.toString().padStart(len);
}

function formatNumber(num) {
  return num.toLocaleString();
}

export function formatOutput(results, options = {}) {
  const { json = false, color = true } = options;
  
  if (json) {
    return JSON.stringify(results, null, 2);
  }
  
  const { byLanguage, totalStats } = results;
  const lines = [];
  
  // Header
  lines.push('');
  lines.push(colorize('═══════════════════════════════════════════════════════════════════════════════', 'cyan', color));
  lines.push(colorize('                           LINES OF CODE REPORT                                ', 'bold', color));
  lines.push(colorize('═══════════════════════════════════════════════════════════════════════════════', 'cyan', color));
  lines.push('');
  
  // Summary
  lines.push(colorize('  SUMMARY', 'bold', color));
  lines.push(colorize('  ───────', 'gray', color));
  lines.push(`  ${colorize('Total Files:', 'gray', color)}    ${colorize(formatNumber(totalStats.files), 'green', color)}`);
  lines.push(`  ${colorize('Total Lines:', 'gray', color)}    ${colorize(formatNumber(totalStats.total), 'green', color)}`);
  lines.push(`  ${colorize('Code Lines:', 'gray', color)}     ${colorize(formatNumber(totalStats.code), 'cyan', color)}`);
  lines.push(`  ${colorize('Comments:', 'gray', color)}       ${colorize(formatNumber(totalStats.comments), 'blue', color)}`);
  lines.push(`  ${colorize('Blank Lines:', 'gray', color)}    ${colorize(formatNumber(totalStats.blanks), 'gray', color)}`);
  lines.push(`  ${colorize('TODOs:', 'gray', color)}          ${colorize(formatNumber(totalStats.todos), 'yellow', color)}`);
  lines.push(`  ${colorize('FIXMEs:', 'gray', color)}         ${colorize(formatNumber(totalStats.fixmes), 'magenta', color)}`);
  lines.push('');
  
  // Code vs Comments ratio
  const codePercent = totalStats.total > 0 ? ((totalStats.code / totalStats.total) * 100).toFixed(1) : 0;
  const commentPercent = totalStats.total > 0 ? ((totalStats.comments / totalStats.total) * 100).toFixed(1) : 0;
  lines.push(`  ${colorize('Code Ratio:', 'gray', color)}     ${colorize(codePercent + '%', 'cyan', color)}`);
  lines.push(`  ${colorize('Comment Ratio:', 'gray', color)}  ${colorize(commentPercent + '%', 'blue', color)}`);
  lines.push('');
  
  // By Language table
  lines.push(colorize('  BY LANGUAGE', 'bold', color));
  lines.push(colorize('  ───────────', 'gray', color));
  
  const header = `  ${padRight('Language', 15)} ${padLeft('Files', 8)} ${padLeft('Code', 10)} ${padLeft('Comments', 10)} ${padLeft('Blanks', 10)} ${padLeft('Total', 10)}`;
  lines.push(colorize(header, 'gray', color));
  lines.push(colorize('  ' + '─'.repeat(73), 'gray', color));
  
  // Sort by code lines descending
  const sorted = Object.entries(byLanguage).sort((a, b) => b[1].code - a[1].code);
  
  for (const [lang, stats] of sorted) {
    const row = `  ${padRight(lang, 15)} ${padLeft(formatNumber(stats.files), 8)} ${padLeft(formatNumber(stats.code), 10)} ${padLeft(formatNumber(stats.comments), 10)} ${padLeft(formatNumber(stats.blanks), 10)} ${padLeft(formatNumber(stats.total), 10)}`;
    lines.push(row);
  }
  
  lines.push(colorize('  ' + '─'.repeat(73), 'gray', color));
  const totalRow = `  ${colorize(padRight('TOTAL', 15), 'bold', color)} ${padLeft(formatNumber(totalStats.files), 8)} ${padLeft(formatNumber(totalStats.code), 10)} ${padLeft(formatNumber(totalStats.comments), 10)} ${padLeft(formatNumber(totalStats.blanks), 10)} ${padLeft(formatNumber(totalStats.total), 10)}`;
  lines.push(totalRow);
  lines.push('');
  lines.push(colorize('═══════════════════════════════════════════════════════════════════════════════', 'cyan', color));
  lines.push('');
  
  return lines.join('\n');
}

export async function writeReport(filename, results) {
  const { byLanguage, totalStats, fileDetails, basePath } = results;
  const lines = [];
  const date = new Date().toISOString();
  
  lines.push('LINES OF CODE REPORT');
  lines.push('====================');
  lines.push(`Generated: ${date}`);
  lines.push(`Path: ${basePath}`);
  lines.push('');
  
  lines.push('SUMMARY');
  lines.push('-------');
  lines.push(`Total Files:    ${totalStats.files}`);
  lines.push(`Total Lines:    ${totalStats.total}`);
  lines.push(`Code Lines:     ${totalStats.code}`);
  lines.push(`Comments:       ${totalStats.comments}`);
  lines.push(`Blank Lines:    ${totalStats.blanks}`);
  lines.push(`TODOs:          ${totalStats.todos}`);
  lines.push(`FIXMEs:         ${totalStats.fixmes}`);
  lines.push('');
  
  const codePercent = totalStats.total > 0 ? ((totalStats.code / totalStats.total) * 100).toFixed(1) : 0;
  const commentPercent = totalStats.total > 0 ? ((totalStats.comments / totalStats.total) * 100).toFixed(1) : 0;
  lines.push(`Code Ratio:     ${codePercent}%`);
  lines.push(`Comment Ratio:  ${commentPercent}%`);
  lines.push('');
  
  lines.push('BY LANGUAGE');
  lines.push('-----------');
  const sorted = Object.entries(byLanguage).sort((a, b) => b[1].code - a[1].code);
  for (const [lang, stats] of sorted) {
    lines.push(`${lang}: ${stats.files} files, ${stats.code} code, ${stats.comments} comments, ${stats.blanks} blanks`);
  }
  lines.push('');
  
  lines.push('FILE DETAILS');
  lines.push('------------');
  for (const file of fileDetails.sort((a, b) => b.code - a.code).slice(0, 50)) {
    lines.push(`${file.file}: ${file.code} code, ${file.comments} comments, ${file.blanks} blanks`);
  }
  if (fileDetails.length > 50) {
    lines.push(`... and ${fileDetails.length - 50} more files`);
  }
  
  await writeFile(filename, lines.join('\n'), 'utf-8');
}
