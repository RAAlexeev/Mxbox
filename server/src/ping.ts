import ping from 'ping';
import cmd  from 'node-cmd'
import { setDO } from './io';
import { db_settings } from './schema';


const lamp = { intervalId:undefined, state:false }
export const pingWatchDog={enable:false, cntPingFail:0, cntReboot:0}
export const pingWatchStart=()=>{
    db_settings.loadDatabase();
    db_settings.findOne({_id:'settings'},(err, settings:any)=>{
        if(err)console.error(err)
        else if(settings){
            if( settings.hasOwnProperty('cntReboot')){
                if(settings.maxCntReboot && settings.cntReboot>=settings.maxCntReboot ){
                    settings={cntReboot:0,pingWatchDogEnable:false}
                    var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.error(err); this.reject(err)} else{ this.resolve() }}            
                    const p = new Promise((resolve,reject)=>{db_settings.update<void>({_id:'settings'},{$set:settings} , {upsert:true}, callback.bind({resolve,reject}))})    
                    p.then((v)=>v).catch((v)=>v)
                    }
                pingWatchDog.cntReboot=0
            }
            if( settings.hasOwnProperty('pingWatchDogEnable') )pingWatchDog.enable=settings.pingWatchDogEnable
          
        }
    })
    setInterval(()=>{if( pingWatchDog.enable )ping.sys.probe('ya.ru', (isAlive)=>{
        const msg = isAlive ? 'host ' + 'ya.ru' + ' is alive' : 'host ' + 'ya.ru' + ' is dead';
        if(!isAlive) {

            if( pingWatchDog.enable && (pingWatchDog.cntPingFail++ >= 5) ){
                db_settings.update({_id:"settings"},{set:{ cntReboot:++pingWatchDog.cntReboot }},{upsert:true},()=>cmd.run('reboot'))
           
            }        
                setDO(4,0)  // погасить
                if( pingWatchDog.cntPingFail && !(pingWatchDog.cntPingFail % 6) ){ 
                    cmd.run('svc data disable&&sleep 10 &&svc data enable')
                }
        }else{ if(lamp.intervalId === undefined)//lamp.intervalId = setInterval(()=>{
        //lamp.state =  !lamp.state
//if( lamp.state ) 
        setDO(4,1) // зажеч      
     //   else
      //  setDO(4,0)  // погасить
        
        //}        ,200) as any
        pingWatchDog.cntPingFail=0;
    console.log(msg);
        }
    })},60000);
}