import assert from 'node:assert/strict';
import test from 'node:test';
import {isIOSDevice} from '../src/device.ts';

test('detects iPhone and classic iPad user agents',()=>{
 assert.equal(isIOSDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)','iPhone',5),true);
 assert.equal(isIOSDevice('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)','iPad',5),true);
});

test('detects iPadOS desktop mode but not Windows or a regular Mac',()=>{
 assert.equal(isIOSDevice('Mozilla/5.0 (Macintosh)','MacIntel',5),true);
 assert.equal(isIOSDevice('Mozilla/5.0 (Macintosh)','MacIntel',0),false);
 assert.equal(isIOSDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)','Win32',10),false);
});
