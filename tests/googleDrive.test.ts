import assert from 'node:assert/strict';
import test from 'node:test';
import {isDriveAudio} from '../src/googleDrive.ts';

test('Drive audio filter accepts audio MIME types and known audio extensions',()=>{
 assert.equal(isDriveAudio({id:'1',name:'lesson.bin',mimeType:'audio/mpeg'}),true);
 assert.equal(isDriveAudio({id:'2',name:'recording.FLAC',mimeType:'application/octet-stream'}),true);
 assert.equal(isDriveAudio({id:'3',name:'notes.pdf',mimeType:'application/pdf'}),false);
});
