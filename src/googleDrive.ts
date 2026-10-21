export interface DriveAudioFile {id:string;name:string;mimeType:string;size?:string;modifiedTime?:string;capabilities?:{canDownload?:boolean}}

interface GoogleTokenResponse {access_token?:string;error?:string;error_description?:string}
interface GoogleTokenClient {requestAccessToken(config?:{prompt?:string}):void}
interface GoogleIdentity {
 accounts:{oauth2:{initTokenClient(config:{client_id:string;scope:string;callback:(response:GoogleTokenResponse)=>void;error_callback?:(error:{type?:string})=>void}):GoogleTokenClient}}
}

declare global {interface Window {google?:GoogleIdentity}}

const AUDIO_EXTENSIONS=/\.(mp3|wav|flac|m4a|aac|ogg|opus|aiff?|wma|ape|alac|mp4|webm)$/i;

export function isDriveAudio(file:DriveAudioFile):boolean {
 return file.mimeType.startsWith('audio/')||AUDIO_EXTENSIONS.test(file.name);
}

export function loadGoogleIdentity():Promise<void> {
 if(window.google?.accounts.oauth2)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const existing=document.querySelector<HTMLScriptElement>('script[data-google-identity]');
  if(existing){existing.addEventListener('load',()=>resolve(),{once:true});existing.addEventListener('error',()=>reject(Error('Google認証ライブラリを読み込めませんでした')),{once:true});return}
  const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;script.dataset.googleIdentity='true';script.onload=()=>resolve();script.onerror=()=>reject(Error('Google認証ライブラリを読み込めませんでした'));document.head.appendChild(script);
 });
}

export async function authorizeDrive(clientId:string):Promise<string> {
 await loadGoogleIdentity();
 const oauth=window.google?.accounts.oauth2;
 if(!oauth)throw Error('Google認証を開始できませんでした');
 return new Promise((resolve,reject)=>{
  const client=oauth.initTokenClient({
   client_id:clientId,
   scope:'https://www.googleapis.com/auth/drive.readonly',
   callback:response=>response.access_token?resolve(response.access_token):reject(Error(response.error_description||response.error||'Google Driveの認証に失敗しました')),
   error_callback:error=>reject(Error(error.type==='popup_closed'?'Googleの認証画面が閉じられました':'Googleの認証画面を開けませんでした'))
  });
  client.requestAccessToken({prompt:''});
 });
}

async function driveFetch(url:string,token:string):Promise<Response> {
 const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
 if(response.status===401)throw Error('Google Driveの認証期限が切れました。もう一度接続してください。');
 if(!response.ok)throw Error(`Google Driveの読み込みに失敗しました（${response.status}）`);
 return response;
}

export async function listDriveAudio(token:string):Promise<DriveAudioFile[]> {
 const result:DriveAudioFile[]=[];let pageToken='';
 do{
  const params=new URLSearchParams({pageSize:'1000',q:'trashed = false',orderBy:'name',fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime,capabilities(canDownload))',spaces:'drive',includeItemsFromAllDrives:'true',supportsAllDrives:'true'});
  if(pageToken)params.set('pageToken',pageToken);
  const response=await driveFetch(`https://www.googleapis.com/drive/v3/files?${params}`,token);
  const data=await response.json() as {files?:DriveAudioFile[];nextPageToken?:string};
  result.push(...(data.files||[]).filter(file=>isDriveAudio(file)&&file.capabilities?.canDownload!==false));pageToken=data.nextPageToken||'';
 }while(pageToken);
 return result;
}

export async function downloadDriveAudio(file:DriveAudioFile,token:string):Promise<File> {
 const response=await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media&supportsAllDrives=true`,token);
 const blob=await response.blob();
 return new File([blob],file.name,{type:file.mimeType||blob.type||'application/octet-stream'});
}
