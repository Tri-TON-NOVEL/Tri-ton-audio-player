export interface Track {id:string;name:string;type:string;size:number;duration?:number;added:number}
export interface Playlist {id:string;name:string;trackIds:string[]}
export type Feature='speed'|'ab'|'gap'|'playlist'|'eq'|'skip'|'bookmarks'|'pitch'|'wave';
export interface Profile {id:string;name:string;builtIn?:boolean;features:Feature[];speed:number;gap:number;preservePitch:boolean}
export type RepeatMode='off'|'one'|'all';
export interface AppSettings {profiles:Profile[];activeProfileId:string;simple:boolean;playlists:Playlist[];selectedPlaylistId:string|null;repeat:RepeatMode;shuffle:boolean;vol:number;positions:Record<string,number>;bookmarks:Record<string,number[]>;loopPoints:Record<string,{a:number|null;b:number|null}>;loopOn:boolean;gap:number;speed:number;pitch:boolean;eq:number[]}
export const ALL_FEATURES:Feature[]=['speed','ab','gap','playlist','eq','skip','bookmarks','pitch','wave'];
export const LABELS:Record<Feature,string>={speed:'速度変更',ab:'A-B区間リピート',gap:'リピート間休止',playlist:'再生リスト',eq:'3バンドEQ',skip:'秒送り／秒戻し',bookmarks:'ブックマーク',pitch:'ピッチ維持',wave:'再生位置表示'};
export const builtIns:Profile[]=[
{id:'music',name:'標準音楽',builtIn:true,features:['playlist','speed','wave'],speed:1,gap:0,preservePitch:true},
{id:'practice',name:'音楽練習',builtIn:true,features:['speed','ab','gap','playlist','pitch','skip','eq','wave'],speed:.8,gap:2,preservePitch:true},
{id:'english',name:'英語リスニング',builtIn:true,features:['speed','ab','gap','skip','bookmarks','pitch','wave'],speed:.8,gap:3,preservePitch:true},
{id:'books',name:'オーディオブック',builtIn:true,features:['speed','skip','bookmarks','playlist','wave'],speed:1,gap:0,preservePitch:true}
];
export const DEFAULT:AppSettings={profiles:builtIns,activeProfileId:'music',simple:true,playlists:[],selectedPlaylistId:null,repeat:'off',shuffle:false,vol:1,positions:{},bookmarks:{},loopPoints:{},loopOn:false,gap:0,speed:1,pitch:true,eq:[0,0,0]};
const SETTINGS_KEY='tri-ton-audio-v1';
export function loadSettings():AppSettings {try {const item=localStorage.getItem(SETTINGS_KEY);if(!item)return structuredClone(DEFAULT);const s=JSON.parse(item) as Partial<AppSettings>;return {...structuredClone(DEFAULT),...s,profiles:Array.isArray(s.profiles)?s.profiles:builtIns}}catch{return structuredClone(DEFAULT)}}
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
