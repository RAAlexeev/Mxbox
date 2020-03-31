import  * as fs  from 'fs'
export const _di = [32] 
export const _do = [1]
export function setDO(num:number,value:number){
   fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin',`-w=${num}:0 0 0 ${value} 0 1 0`,(err)=>{if (err) console.error('setDO:',err);})
}
export const di=(n:number)=>new Promise((resolve,reject)=>fs.readFile('/sys/devices/virtual/misc/mtgpio/pin','utf8',(err,data:string)=>{
   if(err)reject(err)
   resolve(data[70+n*14]==='1')
}))

export function ioInit(){
  for (const n in _di) {
   fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin',`-w=${n}:0 0 0 0 0 0 0`,(err)=>{if (err) console.error('ioInit:',err);})
  }

}