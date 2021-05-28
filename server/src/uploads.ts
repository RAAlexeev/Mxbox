
import * as fs from 'fs'
import shortid from 'short-id'
import * as zlib from 'zlib'
import * as tar from 'tar-fs'
import * as crypto from 'crypto'
import { modem } from './init'
import cmd from 'node-cmd'

export function updateProc(stream){
 
    const key = Buffer.from('DD40F61878B23CFF441652518DB6BF7F11C6AC997CEEBDEFABFEC02A9F532CAF','hex')
    const iv = Buffer.from('03E5254B8166E4BA1E27B07FE831064F', 'hex')
//    console.log(key,'/',iv)
    const ungzip = zlib.createGunzip();
    const decipher = crypto.createDecipheriv('aes-256-cbc' ,key, iv);

     // const path = `./uploads/${id}-${filename}`

      const p =   new Promise((resolve, reject) =>{
     
       const dir = '/data/mxBox/upd'/// __dirname ===  '/data/mxBox' ? 'data/mxBox':'/data/mxBox'
       console.dir(stream)
         stream
           .on('error', error => {
            console.error(error)
           
            if(stream.truncated)
              // Delete the truncated file.
               fs.unlinkSync(dir)
             reject(error)
          })
            .pipe(decipher).on('error', error =>{console.error(error);})
            .pipe(ungzip).on('error', error => {console.error(error);})
            .pipe(tar.extract(dir)).on('error', error => { console.error(error);})
            .on('finish', () =>{ 
            console.log('procUpload:','all finish')
            setTimeout( ()=>cmd.run("rm -R /data/local/tmp/expressUpload/*") )
                              if( modem.isOpened ) {modem.close(()=>{
                                  setTimeout( ()=>process.exit(0), 5000)})
                              }else setTimeout( ()=>process.exit(0), 5000)

                             resolve("Успешно загружено... перезагрузка....")
                              })
     
    
   
    })
    return p.then((x)=>x).catch((x)=>x)
}

export  function  settingsUpload(stream)  {

  const ungzip = zlib.createGunzip();


    const id = shortid.generate()
   
    
    const p = new Promise((resolve, reject) =>{
    

       stream
         .on('error', error => {
          if (stream.truncated)
             // Delete the truncated file.
             fs.unlinkSync('/data/mxBox/DB')
           reject(error)
        })
        .pipe(ungzip).on('error', error => reject(error))
        .pipe(tar.extract('/data/mxBox/DB'))
        //.pipe(fs.createWriteStream(path))
        .on('error', error => reject(error))
        .on('finish', () =>{                
          resolve("Успешно загружено... перезагрузка....")
          process.exit()
        })
    })
  
  return p.then((x)=>x).catch((x)=>x)

  
  }