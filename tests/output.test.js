import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatOutput, writeReport } from '../src/output.js';
import { readFile, unlink } from 'fs/promises';
import { resolve } from 'path';

const mockResults = {
  byLanguage: {
    'JavaScript': { files: 5, total: 200, code: 150, comments: 30, blanks: 20, todos: 3, fixmes: 1 },
    'TypeScript': { files: 3, total: 100, code: 80, comments: 10, blanks: 10, todos: 1, fixmes: 0 },
  },
  totalStats: { files: 8, total: 300, code: 230, comments: 40, blanks: 30, todos: 4, fixmes: 1 },
  fileDetails: [
    { file: './src/index.js', ext: 'js', total: 100, code: 80, comments: 10, blanks: 10, todos: 1, fixmes: 0 },
    { file: './src/utils.ts', ext: 'ts', total: 50, code: 40, comments: 5, blanks: 5, todos: 0, fixmes: 1 },
  ],
  basePath: '/test/path',
};

describe('formatOutput', () => {
  it('should return formatted string output', () => {
    const output = formatOutput(mockResults, { color: false });
    
    expect(typeof output).toBe('string');
    expect(output).toContain('LINES OF CODE REPORT');
    expect(output).toContain('SUMMARY');
    expect(output).toContain('BY LANGUAGE');
  });

  it('should include all statistics in output', () => {
    const output = formatOutput(mockResults, { color: false });
    
    expect(output).toContain('8'); // files
    expect(output).toContain('300'); // total
    expect(output).toContain('230'); // code
    expect(output).toContain('40'); // comments
    expect(output).toContain('30'); // blanks
    expect(output).toContain('4'); // todos
    expect(output).toContain('1'); // fixmes
  });

  it('should include language breakdown', () => {
    const output = formatOutput(mockResults, { color: false });
    
    expect(output).toContain('JavaScript');
    expect(output).toContain('TypeScript');
  });

  it('should return JSON when json option is true', () => {
    const output = formatOutput(mockResults, { json: true });
    
    const parsed = JSON.parse(output);
    expect(parsed.totalStats.files).toBe(8);
    expect(parsed.byLanguage.JavaScript).toBeDefined();
  });

  it('should calculate correct percentages', () => {
    const output = formatOutput(mockResults, { color: false });
    
    // 230/300 = 76.7%
    expect(output).toContain('76.7%');
    // 40/300 = 13.3%
    expect(output).toContain('13.3%');
  });

  it('should handle empty results', () => {
    const emptyResults = {
      byLanguage: {},
      totalStats: { files: 0, total: 0, code: 0, comments: 0, blanks: 0, todos: 0, fixmes: 0 },
      fileDetails: [],
      basePath: '/test',
    };
    
    const output = formatOutput(emptyResults, { color: false });
    expect(output).toContain('0');
  });
});

describe('writeReport', () => {
  const testReportPath = resolve(import.meta.dirname, 'test-report.txt');
  
  afterEach(async () => {
    try {
      await unlink(testReportPath);
    } catch {
      // File might not exist
    }
  });

  it('should write report to file', async () => {
    await writeReport(testReportPath, mockResults);
    
    const content = await readFile(testReportPath, 'utf-8');
    expect(content).toContain('LINES OF CODE REPORT');
    expect(content).toContain('SUMMARY');
  });

  it('should include all sections in report', async () => {
    await writeReport(testReportPath, mockResults);
    
    const content = await readFile(testReportPath, 'utf-8');
    expect(content).toContain('BY LANGUAGE');
    expect(content).toContain('FILE DETAILS');
    expect(content).toContain('Generated:');
  });

  it('should include statistics in report', async () => {
    await writeReport(testReportPath, mockResults);
    
    const content = await readFile(testReportPath, 'utf-8');
    expect(content).toContain('Total Files:');
    expect(content).toContain('Code Lines:');
    expect(content).toContain('TODOs:');
  });

  it('should include file details in report', async () => {
    await writeReport(testReportPath, mockResults);
    
    const content = await readFile(testReportPath, 'utf-8');
    expect(content).toContain('./src/index.js');
  });
});
