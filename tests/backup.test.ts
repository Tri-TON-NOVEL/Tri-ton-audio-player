import assert from 'node:assert/strict';
import test from 'node:test';
import {backupFileName} from '../src/backup.ts';

test('backup file name keeps a custom name and adds one json extension',()=>{
 assert.equal(backupFileName('練習用設定'),'練習用設定.json');
 assert.equal(backupFileName('my-backup.json'),'my-backup.json');
});

test('backup file name replaces characters invalid on Windows',()=>{
 assert.equal(backupFileName('2026/設定:*'),'2026_設定__.json');
});
