export interface Track {id:string;name:string;type:string;size:number;duration?:number;added:number}
export interface Playlist {id:string;name:string;trackIds:string[]}
export type Feature='speed'|'ab'|'gap'|'playlist'|'eq'|'skip'|'bookmarks'|'pitch'|'wave';
export interface Profile {id:string;name:string;builtIn?:boolean;features:Feature[];speed:number;gap:number;preservePitch:boolean}
export type RepeatMode='off'|'one'|'all';
export interface AppSettings {profiles:Profile[];activeProfileId:string;simple:boolean;libraryCompact:boolean;googleClientId:string;playlists:Playlist[];selectedPlaylistId:string|null;repeat:RepeatMode;shuffle:boolean;vol:number;positions:Record<string,number>;bookmarks:Record<string,number[]>;loopPoints:Record<string,{a:number|null;b:number|null}>;loopOn:boolean;gap:number;speed:number;pitch:boolean;eq:number[]}
export const ALL_FEATURES:Feature[]=['speed','ab','gap','eq','skip','bookmarks','pitch','wave'];
export const LABELS:Record<Feature,string>={speed:'速度変更',ab:'A-B区間リピート',gap:'リピート間休止',playlist:'再生リスト',eq:'3バンドEQ',skip:'秒送り／秒戻し',bookmarks:'ブックマーク',pitch:'ピッチ維持',wave:'再生位置表示'};
export const builtIns:Profile[]=[
{id:'music',name:'音楽',builtIn:true,features:['eq','wave'],speed:1,gap:0,preservePitch:true},
{id:'practice',name:'楽器練習',builtIn:true,features:['speed','ab','gap','skip','bookmarks','pitch','wave'],speed:.8,gap:2,preservePitch:true},
{id:'study',name:'学習',builtIn:true,features:['speed','skip','bookmarks','pitch','wave'],speed:1,gap:0,preservePitch:true}
];
export const DEFAULT:AppSettings={profiles:builtIns,activeProfileId:'music',simple:true,libraryCompact:true,googleClientId:'',playlists:[],selectedPlaylistId:null,repeat:'off',shuffle:false,vol:1,positions:{},bookmarks:{},loopPoints:{},loopOn:false,gap:0,speed:1,pitch:true,eq:[0,0,0]};
const SETTINGS_KEY='tri-ton-audio-v1';
const LEGACY_BUILT_IN_IDS=new Set(['music','practice','english','books','study']);
const isFeature=(value:unknown):value is Feature=>typeof value==='string'&&ALL_FEATURES.includes(value as Feature);
const cloneBuiltIns=()=>builtIns.map(profile=>({...profile,features:[...profile.features]}));
export function migrateSettings(value:unknown):AppSettings {
 const base=structuredClone(DEFAULT);
 if(!value||typeof value!=='object')return base;
 const source=value as Partial<AppSettings>;
 const savedProfiles=Array.isArray(source.profiles)?source.profiles:[];
 const customProfiles=savedProfiles.filter(profile=>profile&&typeof profile==='object'&&(!profile.builtIn||!LEGACY_BUILT_IN_IDS.has(profile.id))).map((profile,index)=>({
  ...profile,
  id:LEGACY_BUILT_IN_IDS.has(profile.id)?`custom-${profile.id}-${index}`:profile.id,
  name:typeof profile.name==='string'&&profile.name.trim()?profile.name:'名称未設定',
  builtIn:false,
  features:Array.isArray(profile.features)?profile.features.filter(isFeature):[],
  speed:Number.isFinite(profile.speed)?profile.speed:1,
  gap:Number.isFinite(profile.gap)?profile.gap:0,
  preservePitch:profile.preservePitch!==false
 }));
 const profiles=[...cloneBuiltIns(),...customProfiles];
 const requestedId=source.activeProfileId==='english'?'study':source.activeProfileId==='books'?'music':source.activeProfileId;
 const activeProfileId=profiles.some(profile=>profile.id===requestedId)?requestedId!:'music';
 return {...base,...source,profiles,activeProfileId,libraryCompact:source.libraryCompact!==false,googleClientId:typeof source.googleClientId==='string'?source.googleClientId:'',playlists:Array.isArray(source.playlists)?source.playlists:base.playlists,positions:source.positions||{},bookmarks:source.bookmarks||{},loopPoints:source.loopPoints||{},eq:Array.isArray(source.eq)?source.eq:base.eq};
}
export function loadSettings():AppSettings {try {const item=localStorage.getItem(SETTINGS_KEY);return item?migrateSettings(JSON.parse(item)):structuredClone(DEFAULT)}catch{return structuredClone(DEFAULT)}}
export function saveSettings(s:AppSettings){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(s))}catch(e){console.warn('設定の保存に失敗',e)}}
let opened:Promise<IDBDatabase>|undefined;
function db(){return opened ||= new Promise((resolve,reject)=>{const r=indexedDB.open('tri-ton-audio-db',1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('tracks'))d.createObjectStore('tracks',{keyPath:'id'});if(!d.objectStoreNames.contains('audio'))d.createObjectStore('audio')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function transaction<T>(store:'tracks'|'audio',mode:IDBTransactionMode,execute:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{return db().then(d=>new Promise((resolve,reject)=>{const t=d.transaction(store,mode);const req=execute(t.objectStore(store));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);t.onerror=()=>reject(t.error)}))}
export async function getTracks():Promise<Track[]>{return transaction<Track[]>('tracks','readonly',s=>s.getAll())}
export async function getAudio(id:string):Promise<Blob|undefined>{return transaction<Blob|undefined>('audio','readonly',s=>s.get(id))}
export async function addTrack(file:File):Promise<Track>{const t:Track={id:crypto.randomUUID(),name:file.name.replace(/\.[^.]+$/,''),type:file.type,size:file.size,added:Date.now()};await transaction('audio','readwrite',s=>s.put(file,t.id));await transaction('tracks','readwrite',s=>s.put(t));return t}
export async function replaceTrack(track:Track,file:File):Promise<Track>{const updated:Track={...track,name:file.name.replace(/\.[^.]+$/,''),type:file.type,size:file.size};await transaction('audio','readwrite',s=>s.put(file,track.id));await transaction('tracks','readwrite',s=>s.put(updated));return updated}
export async function deleteTrack(id:string){await transaction('audio','readwrite',s=>s.delete(id));await transaction('tracks','readwrite',s=>s.delete(id))}
export async function saveTrack(t:Track){await transaction('tracks','readwrite',s=>s.put(t))}
