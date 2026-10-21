import type {AppSettings} from './storage';

export function backupFileName(input:string):string {
 const base=(input.trim()||'tri-ton-backup').replace(/\.json$/i,'').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/[. ]+$/,'');
 return `${base||'tri-ton-backup'}.json`;
}

export function createSettingsBackup(settings:AppSettings){
 return {format:'tri-ton-settings-backup',version:2,createdAt:new Date().toISOString(),settings};
}
