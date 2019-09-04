import ModbusRTU from '../../node_modules/modbus-serial'
import { db, pubsub, LINK_STATE_CHENG, Device, isMutated, portReinit, db_settings, DNK4_UPD_VIEW } from '../schema' 
import { sendMail } from './result/send.email'
import { sendSMS } from './result/send.sms'
import { debug } from 'util'
import SerialPort from 'serialport'
import { TCPproxyReguest } from './modbusProxy/TCP.proxy';
import cmd  from 'node-cmd'

//import { findTypesThatChangedKind } from 'graphql/utilities/findBreakingChanges';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const client = new ModbusRTU();
export const RTUproxyReguest:any[] = [];
var  elapsed = false
export const modbusTestRun = async()=> db.find({ 'rules.trigs.type':0 }
            ,async( err,  devices:Device[] )=>{
                if(err) console.error(err) 
                  try{  
                       
                            db_settings.loadDatabase();
                            

                            
                            db_settings.findOne<any>( { '_id':'portsSettings' },
                                  async( err,  settings )=>{

                                if(err) {
                                    console.error(err)
                                    
                                }
                                
                                if(!settings['0'])settings['0']={speed:19200, param:'8e1'}
                                else{
                                    if(!settings['0'].speed)settings['0'].speed=19200
                                    if(!settings['0'].param)settings['0'].param='8e1'
                                }
                                if(!settings['1'])settings['1']={speed:19200, param:'8e1'}
                                else{
                                    if(!settings['1'].speed)settings['1'].speed=19200
                                    if(!settings['1'].param)settings['1'].param='8e1'
                                }
                               const parity=(param)=>{switch(param[1]){
                                    case 'e': return 'even' //'none' | 'even' | 'mark' | 'odd' | 'space'
                                    case 'o': return 'odd'
                                    case 'n': return 'none'
                                    case 's': return 'space'
                                    }
                                }
                                  
                                        client.setTimeout(1000);
                                        
                                                const cancelPromise = (obj)=> new Promise((resolve, reject) => {
                                                    obj.cancel = resolve.bind(null, { canceled: true })
                                                    
                                                }) 
                                        const proxyPort = new SerialPort("/dev/ttyMT0", { baudRate: settings['1'].speed, parity:parity(settings['1'].param), stopBits: parseInt(settings['1'].param[2]) })
                                       
                                        proxyPort.on("data",data=>{
                                            console.log('proxyPort.data:',data)
                                            if([1,2,3,4,5,6,15,16].includes(data[1])){
                                              if(data.length === 2 + 4 + 2 + ( [15,16].includes(data[1]) ? data[6]:0) ){
                                                RTUproxyReguest.push({data:data, query:0})
                                                if(proxyPort.cancel)proxyPort.cancel()
                                              }
                                              else{
                                                    const index = data.findIndex((item,index,array)=>{
                                                        return ((index > (2 + 4 + ([15,16].includes(array[1])?array[6]:0) + 2+1)) && [1,2,3,4,5,6,15,16].includes(item) )                                                
                                                })
                                                if(index>=0) {
                                                    proxyPort.buff = data.splice(index,data.length-index)
                                                    RTUproxyReguest.push({data:data, query:0})
                                                    if(proxyPort.cancel)proxyPort.cancel()
                                                }
                                              }
                                            } else {
                                                if(proxyPort.buff){
                                                    RTUproxyReguest.push({data:proxyPort.buff.push(data), query:0})
                                                    if(proxyPort.cancel)proxyPort.cancel()
                                                    delete(proxyPort.buff)
                                                }
                                            }
                                        })
                                        
                                        const port = new SerialPort("/dev/ttyMT1",{ baudRate: settings['0'].speed, parity:parity(settings['0'].param), stopBits: parseInt(settings['0'].param[2]) })
                                        port.on("data", data=>{
                                           
                                            if( RTUproxyReguest[0] )
                                            if( RTUproxyReguest[0].query ) {
                                                if([1,2,3,5].includes(data[1]) && (data[2] > data.length-2-1-2)){
                                                    port.buf =  Buffer.from( data )
                                                    return 
                                                }else if(port.buf){
                                                  
                                                    if(port.buf[2] > port.buf.length-2-1-2){
                                                        port.buf=Buffer.concat([port.buf,data],port.buf.length+data.length)    
                                                        if(port.buf[2] > port.buf.length-2-1-2)return
                                                    }
                                                
                                                }  
                                                RTUproxyReguest.shift() 
                                                if(port.cancel)port.cancel()
                                                proxyPort.write(port.buf? port.buf : data)
                                                delete port.buf
                                               
                                                
                                            }
                                            if(TCPproxyReguest[0])
                                            if(TCPproxyReguest[0].query) {
                                                TCPproxyReguest.shift().sock.write(data)     
                                            }
                                            
                                        })
                           
                                       
                                        const tOut = { trig:100,tout:setInterval(()=>{if(tOut.trig)tOut.trig--},30000)} 
                                        
                                        const proxyQuery = async(device)=>{  
                                            try{
                                               // debug(port.isOpen)  

                                                if( (!(RTUproxyReguest.length||TCPproxyReguest.length) && tOut.trig%10) || !tOut.trig)  {
                                                   
                                                  // clearTimeout(tOut)
                                                  // tOut = setTimeout(()=>{elapsed=true},5000)
                                                  tOut.trig=100
                                                    debug('proxyQuery2')  
                                                  
                                                    try{
                                                       if(port.isOpen){ 
                                                        await new Promise((resolve,reject)=>port.close((err)=>{if(err) reject(err); else resolve()} )).catch( (e)=>console.error(e) )
                                                       
                                                        await client.connectRTUBuffered("/dev/ttyMT1", { baudRate: settings['0'].speed, parity:parity(settings['0'].param), stopBits: parseInt(settings['0'].param[2]) });
                                                       }
                                                        await queryDevice(device)
                                                       
                                                       // await Promise.race([sleep(3000), cancelPromise(proxyPort)])
                                                       
                                                    }catch(e){
                                                     console.error(e)   
                                                    }
                                                    
                                                }else{
                                                    
                                                   // debug('proxyQuery3')
                                                if(!(port.isOpen)){
                                                    
                                                    await Promise.race([new Promise((resolve,reject)=>{ client.close((err)=>{ 
                                                                                                             if(!port.isOpen)port.open(()=>{
                                                                                                                    if(port.isOpen)resolve(); else reject({err:'port not open!'})
                                                                                                                })
                                                                                                            })
                                                                                                        }),sleep(300)])
                                                    
                                                }
                                                const query = async (reguest)=>{ 
                                                        if(reguest.length){
                                                            debug('proxyQuery4')
                                                            //console.dir(reguest)
                                                            reguest[0].query++
                                                            delete(port.buf)
                                                            port.write(reguest[0].data)   
                                                            await Promise.race([sleep(50), cancelPromise(port)]) 
                                                                if(reguest[0])      
                                                                if( reguest[0].query >= 2){
                                                                    console.error(reguest[0],'!timeout!')
                                                                    reguest.shift()  
                                                                }
                                                            
                                                        }
                                                    }
                                                if(port.isOpen){    
                                                    await query(RTUproxyReguest)   
                                                    await query(TCPproxyReguest)      
                                                }

                                              }
                                             }catch(e){
                                                    console.error(e)
                                                    }
                                    
                                        }                                        
                                        const queryDevice = async (device:Device) => {
                                            try {
                                                // set ID of slave
                                                await client.setID(device.mb_addr);
                                               
                                                await TestDevicesModbus.testTrigs(device, client) 
                                                // return the value
                                    
                                            } catch(e){
                                                // if error return -1
                                                console.error(e)
                                            }
                                        }
                                        const queryDevices = async (devices) => {
                                            try{                                             
                                                    // get value of all meters
                                                        for(let device of devices) {
                                                    // output value to console
                                                        
                                                            await proxyQuery(device)
                                                            //await queryDevice(device)
    
                                                        }      
                                            } catch(e){
                                                // if error, handle them here (it should not)
                                                console.log(e)
                                            } finally {

                                                 if(portReinit()) {
                                                    setTimeout(() => {
                                                        modbusTestRun()  
                                                     },1000)
                                                     port.close()
                                                     proxyPort.close()
                                                     client.close(()=>{})
                                               
                                                     return
                                                 }     

                                   /*                db_settings.findOne<any>( { '_id':'portsSettings' }, ( err, newSettings )=>{ if(!err){settings=newSettings
                                                    if(!settings[0])settings[0]={speed:19200, param:'8e1'}
                                                    else{
                                                        if(!settings[0].speed)settings[0].speed=19200
                                                        if(!settings[0].param)settings[0].param='8e1'
                                                    }
                                      
                                                }
                                                 }) */

                                                else 
                                                if(isMutated())
                                                db.find( { 'rules.trigs.type':0 }
                                                    ,( err, devices:Device[] )=>{  
                                                    // after get all data from salve repeate it again
                                                    debug('updated')
                                                    if(!err)
                                                        setImmediate(() => {
                                                            queryDevices(devices);
                                                        })
                                                    else console.error(err)
                                                })
                                                else   setImmediate(() => {
                                                    queryDevices(devices);
                                                })
                                            }
                                        }
                                        // start get value
                                         queryDevices(devices)               
            })
        }catch(e){
            console.error(e)
            setImmediate(() => {
                modbusTestRun();
            })
        }   
    })
                                  
                  
            

interface Sms{
    numbers:Array<string>
    text:string
  }
 export interface Email{
    address:string
    subject:string
    body?:string
  }
  interface Trig{
    jsCode?: string;
    type:number
    condition?:string
    sms?:Sms
    email?:Email
    cron?:string
    regs?:Reg[]
  }
   interface Act{
    sms?:Sms
    email?:Email
    DO?:number[]
  }
  interface Rule {
    trigs?:Trig[]
    acts?:Act[]
  }


interface Reg{
    func:number
    addr:number
    val?:any
    pattern:string
    qualifier:string
}

interface DevicesRulesTimeOut{
   _id:string
   ruleNum:number
   timestamp:Date
}

class TestDevicesModbus {
   

    constructor(){
       
    }
    private static parse ( s:string) :Reg[]{   
        const regs:Reg[] = []  
        const regExp:RegExp= new RegExp(/\[(\d+)\s?(\d?)\.?(\d?[\d,f,u]?)\]/)
        let match = regExp.exec(s)
        while(match){
           
        if( match ){    

                regs.push({
                    pattern:match[0],//0
                    func:match[2]?parseInt(match[1],10):3,//1
                    addr:match[2]?parseInt(match[2],10):parseInt(match[1],10),//2
                    qualifier:match[3]//3
                })
                
            }

            match = regExp.exec(s=s.replace(match[0],''))
        }
   
           
            return regs
    }

    private static modbusError( err, device ){
        pubsub.publish(LINK_STATE_CHENG, { deviceLinkState:{ device:device, state:err.toString() }  });
            console.error(err)
    }


    private static onTrig( device:Device, rule:Rule ){
      
        if( rule && rule.acts ) 
        for(const act of rule.acts)
            {  if( act.email ) sendMail( device, act.email, device.rules.findIndex(_rule=>{return _rule===rule}) ); 
                if(act.sms) sendSMS(act.sms, device) 
                if(act.DO) act.DO.forEach((val,index,array)=>{
                    switch(val){
                        case 0:
                        case 1: cmd.run('echo "-w=140:0 0 0 '+ val +'0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') 
                        break
                        case 2:   cmd.run('echo "-w=140:0 0 0 1 0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') 
                                 setTimeout( cmd.run('echo "-w=140:0 0 0 0 0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') ,1000)
                        break        
                        case 3:   cmd.run('echo "-w=140:0 0 0 0 0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') 
                                 setTimeout( cmd.run('echo "-w=140:0 0 0 1 0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') ,1000)          
                    }
                   
                })
            } 
        
            //send SMSs Emails
    }
    private static  testTrig ( trig:Trig ):boolean{
            
            if( trig.condition  )
            if(trig.jsCode===undefined){

                trig.jsCode = trig.condition.replace(/\=+/g,' === ')
                                            .replace(/or/ig,'||')
                                            .replace(/and/ig,'&&')
                                            .replace(/not/g,'!')
                                            .replace(/<>/g,'!=')
                
            }
            let jsCode:string = trig.jsCode?trig.jsCode:'';
            if( trig && trig.regs ){
             trig.regs.forEach(reg => {
                if( jsCode && reg  )
                    
                    jsCode = jsCode.replace(reg.pattern,'('+ reg.val + ')') 
                })
                //const di:{pattern?:string, index?:number}[] = []  
                const regExp:RegExp= new RegExp(/#DI?(\d+)/)
                if(regExp.test(jsCode))
                 new Promise ((resume, reject)=>cmd.get('cat /sys/devices/virtual/misc/mtgpio/pin',(err,data:string,stderr)=>{
                    const di=(n:number)=>(data[70+n*14]) 
                    let match = regExp.exec(jsCode)  
                    while (match){
                        jsCode = jsCode.replace(match[0],'('+ di(parseInt(match[1]))+')')
                        match = regExp.exec(jsCode)   
                    }
                    resume()
                })).then()  
            try{
                debug('jsCode:'+ jsCode)
                return new Function('','return ('+jsCode+')')()    
            }catch(err){
                console.error(err)
            }

            }    
            return false
    }
        
    private static getSizeDataReguest(reg:Reg):number{
        if( reg.qualifier )
         if( reg.qualifier.search(/f/) ) return 2
         
        return 1
    }    
    private static processResponse(reg:Reg){
        switch(reg.qualifier){
            case 'u': reg.val = reg.val.data[0]
                return
           
           case'f':
                    if(reg.val.register.length === 2)
                
                         reg.val =  new Float32Array(new Uint16Array(reg.val.data).buffer)[0]

                    else console.error('запрашивал 2 регистра получено не 2...  ')
                
            return               

            default: 
                 const bit = parseInt(reg.qualifier)
                 reg.val =new Int16Array( reg.val.data )[0] 
                 console.log('Bit:',bit,' val: ' ,reg.val) 
                 if(bit!==undefined && !isNaN(bit)){
                    reg.val = ((reg.val & (1<<bit)) >> bit )                   
                 }
        }
    }  
    static pumps = 0
    static levels = 0 
    static async getDNK4data(device:Device, client:ModbusRTU ){
        
       let val = await client.readHoldingRegisters(13, 4)
       let sum =  val.data[0] + val.data[1] + val.data[2] + val.data[3]
       if(sum !== this.pumps){
            this.pumps = sum
            pubsub.publish(DNK4_UPD_VIEW, { updDNK4ViewData:{ device:device, pumps:val.data }  });
       }
       val = await client.readHoldingRegisters(13, 4)
       sum =  val.data[0] + val.data[1] + val.data[2] + val.data[3]
       if(sum !== this.levels){
            this.levels = sum
            pubsub.publish(DNK4_UPD_VIEW, { updDNK4ViewData:{ device:device, pumps:this.pumps }  });
       }
    }
    static skip: number = 100;
    static async testTrigs ( device:Device, client:ModbusRTU ){
            for( const rule of device.rules) {
                if(rule && rule.trigs)
                  for(const trig of  rule.trigs){
                        if(trig){
                            if ( trig.condition ){
                                trig.regs =  this.parse(trig.condition)
                                for(const reg of trig.regs){
                                    if((RTUproxyReguest.length||TCPproxyReguest.length)&&this.skip--){
                                        return
                                    }
                                    this.skip = 100  
                                    try{
                                    switch(reg.func){                                    
                                        case 1:  reg.val = await client.readInputRegisters(reg.addr,1)
                                                this.processResponse(reg)
                                        break 
                                        case 2: reg.val = await client.readCoils(reg.addr,1)
                                                this.processResponse(reg)
                                        break
                                        case 3:  reg.val = await client.readHoldingRegisters(reg.addr, this.getSizeDataReguest(reg))
                                                this.processResponse(reg)
                                        break
                                        case 4: reg.val = await client.readInputRegisters(reg.addr, 1)
                                                this.processResponse(reg) 
                                        break 
                                        default: console.error('Неподдержаная функция модбаса или парсер не распарсил!')                                            
                                    }
                                }catch(err){
                                    this.modbusError(err,device)
                                } 
                                }
                               // debug('#trig.active:' + trig.active)
                                if( this.testTrig( trig ) ){ 
                                   debug('#trig.active:' + trig.active)
                                   if(!trig.active)trig.active=0
                                   if(trig.active < 6)++trig.active
                                   if( trig.active === 3 ) 
                                        this.onTrig( device, rule )
                                }else  if(trig.active)--trig.active
                            }
                        }
                    }
                    
                }
            

     }
}

  
