export function isIOSDevice(userAgent:string,platform:string,maxTouchPoints:number):boolean {
 return /iPhone|iPad|iPod/i.test(userAgent)||(platform==='MacIntel'&&maxTouchPoints>1);
}
