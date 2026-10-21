import assert from 'node:assert/strict';
import test from 'node:test';
import {isSupersededPlay,mediaErrorCause,playErrorCause} from '../src/audioStatus.ts';

test('MediaError code 3 is reported as a decode failure',()=>{
  assert.match(mediaErrorCause({code:3,message:''}),/デコード/);
});

test('MediaError code 4 is reported as an unsupported codec or format',()=>{
  assert.match(mediaErrorCause({code:4,message:''}),/形式またはコーデック/);
});

test('play promise rejection keeps the browser reason',()=>{
  assert.match(playErrorCause(new DOMException('gesture required','NotAllowedError')),/再生を許可/);
});

test('only AbortError is treated as a superseded play request',()=>{
  assert.equal(isSupersededPlay(new DOMException('interrupted','AbortError')),true);
  assert.equal(isSupersededPlay(new DOMException('blocked','NotAllowedError')),false);
});
