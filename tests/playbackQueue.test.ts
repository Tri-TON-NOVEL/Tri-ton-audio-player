import assert from 'node:assert/strict';
import test from 'node:test';
import {playbackCandidates} from '../src/playbackQueue.ts';

test('continuous playback produces a finite forward list without wrapping',()=>{
 assert.deepEqual(playbackCandidates(['a','b','c'],'a',1,false),['b','c']);
 assert.deepEqual(playbackCandidates(['a','b','c'],'c',1,false),[]);
});

test('repeat all wraps once and never returns the current track',()=>{
 assert.deepEqual(playbackCandidates(['a','b','c'],'c',1,true),['a','b']);
});

test('duplicate references do not create an infinite traversal',()=>{
 assert.deepEqual(playbackCandidates(['missing','missing','ok'],'missing',1,true),['ok']);
});
