import cmd  from 'node-cmd'
import { setDO } from './io'
export function connectToWiFi(){
    cmd.get("service call wifi 29 i32 0 i32 0 && sleep 2 &&  svc wifi enable",(err,data,stderr)=>{
        if(err) console.error(err)
        console.log(data,stderr)
    })
    const os = require('os')
   setTimeout(()=> (os.networkInterfaces().wlan0 && os.networkInterfaces().wlan0[0].address!='0.0.0.0')?setDO(5,1):setDO(5,0), 5000)
}
export function loadAP(){
    cmd.get("svc wifi disable && sleep 5 && service call wifi 29 i32 0 i32 1",(err,data,stderr)=>{
        if(err) console.error(err)
        console.log(data,stderr)
        const os = require('os');
       if( !os.networkInterfaces().ap0 )
         setImmediate(() => loadAP())
    })
} 