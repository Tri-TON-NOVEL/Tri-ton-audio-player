export function playbackCandidates(ids:string[],currentId:string|null,direction:1|-1,wrap:boolean,shuffle=false,random=Math.random):string[] {
 const unique=[...new Set(ids)];
 if(!unique.length)return [];
 const currentIndex=unique.indexOf(currentId||'');
 let ordered:string[];
 if(shuffle&&direction===1){
  ordered=unique.filter(id=>id!==currentId);
  for(let index=ordered.length-1;index>0;index--){
   const swap=Math.floor(random()*(index+1));
   [ordered[index],ordered[swap]]=[ordered[swap],ordered[index]];
  }
  return ordered;
 }
 if(direction===1){
  const start=currentIndex<0?0:currentIndex+1;
  ordered=unique.slice(start);
  if(wrap)ordered.push(...unique.slice(0,Math.max(0,start-1)));
 }else{
  const start=currentIndex<0?unique.length-1:currentIndex-1;
  ordered=unique.slice(0,start+1).reverse();
  if(wrap)ordered.push(...unique.slice(Math.max(0,currentIndex+1)).reverse());
 }
 return ordered.filter(id=>id!==currentId);
}
