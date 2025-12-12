import { describe, it, expect } from 'vitest';
import { countLoc } from '../src/counter.js';
import { resolve } from 'path';

const fixturesPath = resolve(import.meta.dirname, 'fixtures');

describe('countLoc', () => {
  it('should count files in a directory', async () => {
    const results = await countLoc(fixturesPath);
    
    expect(results.totalStats.files).toBeGreaterThan(0);
    expect(results.byLanguage).toBeDefined();
    expect(results.fileDetails).toBeInstanceOf(Array);
  });

  it('should count JavaScript files correctly', async () => {
    const results = await countLoc(fixturesPath, { extensions: ['js'] });
    
    expect(results.byLanguage['JavaScript']).toBeDefined();
    expect(results.byLanguage['JavaScript'].files).toBe(1);
    expect(results.byLanguage['JavaScript'].code).toBeGreaterThan(0);
    expect(results.byLanguage['JavaScript'].comments).toBeGreaterThan(0);
  });

  it('should detect TODOs and FIXMEs', async () => {
    const results = await countLoc(fixturesPath);
    
    expect(results.totalStats.todos).toBeGreaterThan(0);
    expect(results.totalStats.fixmes).toBeGreaterThan(0);
  });

  it('should count Python files correctly', async () => {
    const results = await countLoc(fixturesPath, { extensions: ['py'] });
    
    expect(results.byLanguage['Python']).toBeDefined();
    expect(results.byLanguage['Python'].files).toBe(1);
    expect(results.byLanguage['Python'].comments).toBeGreaterThan(0);
  });

  it('should count HTML files and detect HTML comments', async () => {
    const results = await countLoc(fixturesPath, { extensions: ['html'] });
    
    expect(results.byLanguage['HTML']).toBeDefined();
    expect(results.byLanguage['HTML'].comments).toBeGreaterThan(0);
  });

  it('should filter by extensions', async () => {
    const results = await countLoc(fixturesPath, { extensions: ['js'] });
    
    expect(Object.keys(results.byLanguage)).toHaveLength(1);
    expect(results.byLanguage['JavaScript']).toBeDefined();
  });

  it('should count blank lines', async () => {
    const results = await countLoc(fixturesPath);
    
    expect(results.totalStats.blanks).toBeGreaterThan(0);
  });

  it('should include file details', async () => {
    const results = await countLoc(fixturesPath);
    
    expect(results.fileDetails.length).toBe(results.totalStats.files);
    results.fileDetails.forEach(file => {
      expect(file).toHaveProperty('file');
      expect(file).toHaveProperty('code');
      expect(file).toHaveProperty('comments');
      expect(file).toHaveProperty('blanks');
      expect(file).toHaveProperty('total');
    });
  });

  it('should handle empty directories gracefully', async () => {
    const results = await countLoc(fixturesPath, { extensions: ['xyz'] });
    
    expect(results.totalStats.files).toBe(0);
    expect(results.totalStats.code).toBe(0);
  });
});

describe('line counting accuracy', () => {
  it('should calculate correct totals', async () => {
    const results = await countLoc(fixturesPath);
    const { totalStats } = results;
    
    // Total should equal code + comments + blanks
    expect(totalStats.total).toBe(totalStats.code + totalStats.comments + totalStats.blanks);
  });

  it('should match language totals with overall total', async () => {
    const results = await countLoc(fixturesPath);
    
    let langTotal = 0;
    Object.values(results.byLanguage).forEach(lang => {
      langTotal += lang.total;
    });
    
    expect(langTotal).toBe(results.totalStats.total);
  });
});
