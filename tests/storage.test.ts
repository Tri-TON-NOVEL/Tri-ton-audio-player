import assert from 'node:assert/strict';
import test from 'node:test';
import {migrateSettings} from '../src/storage.ts';

test('migration restores the three standard profiles and preserves custom profiles and playlists',()=>{
 const migrated=migrateSettings({
  profiles:[
   {id:'music',name:'old music',builtIn:true,features:[],speed:2,gap:9,preservePitch:false},
   {id:'mine',name:'自分用',builtIn:false,features:['speed'],speed:.75,gap:1,preservePitch:true}
  ],
  activeProfileId:'mine',
  playlists:[{id:'list',name:'保存済み',trackIds:['track-1']}]
 });
 assert.deepEqual(migrated.profiles.slice(0,3).map(profile=>profile.name),['音楽','楽器練習','学習']);
 assert.equal(migrated.profiles.find(profile=>profile.id==='mine')?.name,'自分用');
 assert.deepEqual(migrated.playlists,[{id:'list',name:'保存済み',trackIds:['track-1']}]);
 assert.equal(migrated.activeProfileId,'mine');
});

test('legacy listening profile is migrated to study',()=>{
 const migrated=migrateSettings({profiles:[],activeProfileId:'english',playlists:[]});
 assert.equal(migrated.activeProfileId,'study');
});
