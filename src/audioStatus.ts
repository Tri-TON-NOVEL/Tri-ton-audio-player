export type AudioCheckState='unknown'|'checking'|'ready'|'unplayable'|'missing';

export interface AudioStatus {
  state:AudioCheckState;
  cause?:string;
}

export const INITIAL_AUDIO_STATUS:AudioStatus={state:'unknown'};

export function mediaErrorCause(error:Pick<MediaError,'code'|'message'>|null):string {
  if(!error)return '音声の読み込み中に不明なエラーが発生しました';
  const detail=error.message?.trim();
  const cause=error.code===1?'読み込みが中断されました'
    :error.code===2?'音声データを読み込めませんでした'
    :error.code===3?'音声データをデコードできませんでした'
    :error.code===4?'この端末では形式またはコーデックに対応していません'
    :'音声を読み込めませんでした';
  return detail?`${cause}（${detail}）`:cause;
}

export function playErrorCause(error:unknown):string {
  if(error instanceof DOMException){
    if(error.name==='NotAllowedError')return '端末またはブラウザーに再生を許可されませんでした';
    if(error.name==='NotSupportedError')return 'この端末では形式またはコーデックに対応していません';
    if(error.name==='AbortError')return '再生処理が中断されました';
    if(error.message.trim())return `再生開始に失敗しました（${error.message.trim()}）`;
  }
  if(error instanceof Error&&error.message.trim())return `再生開始に失敗しました（${error.message.trim()}）`;
  return '再生を開始できませんでした';
}

export function isSupersededPlay(error:unknown):boolean {
  return error instanceof DOMException&&error.name==='AbortError';
}
