import ModbusRTU from '../../node_modules/modbus-serial'
import { db, pubsub, LINK_STATE_CHENG, Device, isMutated, portReinit, db_settings, DNK4_UPD_VIEW } from '../schema' 
import { sendMail } from './result/send.email'
import { sendSMS } from './result/send.sms'
import { debug, isArray } from 'util'
import SerialPort from 'serialport'
import { TCPproxyReguest } from './modbusProxy/TCP.proxy';
import cmd  from 'node-cmd'
import { parseCommand } from '../commands/joson';
import  crc16 from 'modbus-serial/utils/crc16'
import * as io from '../io'
//import { findTypesThatChangedKind } from 'graphql/utilities/findBreakingChanges';
const MBAPheaderLenght = 7
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const client = new ModbusRTU();
export const RTUproxyReguest:any[] = [];
var  elapsed = false
export const modbusTestRun = async()=> db.find({ 'rules.trigs.type':0 }
            ,async( err,  devices:Device[] )=>{
                if(err) console.error(err) 
                  try{  
                       
                            db_settings.loadDatabase();
                            
                          //  pubsub.subscribe()
                            
                            db_settings.findOne<any>( { '_id':'portsSettings' },
                                  async( err,  settings )=>{

                                if(err) {
                                    console.error(err)
                                    settings={'0':undefined,'1':undefined}    
                                }
                                if(settings == null)settings={'0':undefined,'1':undefined}    
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
                                            
                                            switch(settings['1'].protocol){
                                            
                                             case 3://AT команды   
                                             break
                                             case 2: parseCommand(data)//   joson
                                             break
                                             case 4://транслировать + AT команды по modbus   
                                             case 1://транслировать + joson по modbus

                                             default:  // транслировать    
                                           // console.log('proxyPort.data:',data)
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
                                        }
                                        })
                                        
                                        const port = new SerialPort("/dev/ttyMT1",{ baudRate: settings['0'].speed, parity:parity(settings['0'].param), stopBits: parseInt(settings['0'].param[2]) })
                                        port.on("data", data=>{
                                                
                                            console.log(data)
                                            
                                                if([1,2,3,5].includes(data[1]) && (data[2] > data.length-2-1-2)){
                                                    port.buf =  Buffer.from( data )
                                                    return 
                                                }else if(port.buf){
                                                  
                                                    if(port.buf[2] > port.buf.length-2-1-2){
                                                        port.buf=Buffer.concat([port.buf,data])    
                                                        if(port.buf[2] > port.buf.length-2-1-2)return
                                                    }
                                                
                                                } 
                                              
                                                if(TCPproxyReguest[0]&&TCPproxyReguest[0].query) {
                                                   const MBAPheader:Buffer = TCPproxyReguest[0].data.slice(0,MBAPheaderLenght-1)
                                                   MBAPheader.writeUInt16LE(port.buf? port.buf.length:data.length,4)
                                                    TCPproxyReguest.shift().sock.write(port.buf? Buffer.concat([MBAPheader, port.buf]) : Buffer.concat([MBAPheader,data]))                                     
                                                }else if(RTUproxyReguest[0]&& RTUproxyReguest[0].query){
                                                    RTUproxyReguest.shift() 
                                                    proxyPort.write(port.buf? port.buf : data)
                                                }
                                                delete port.buf
                                                if(port.cancel)port.cancel()
                                                                                        
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
                                                                                                             if(!port.isOpen)port.open((err)=>{
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
                                                            let data = reguest[0].data
                                                            if(reguest[0].sock){
                                                                const crc:Buffer = Buffer.allocUnsafe(2)
                                                                const data_ = reguest[0].data.slice(MBAPheaderLenght-1)
                                                                crc.writeUInt16LE(crc16(data_),0)
                                                                data = Buffer.concat([data_,crc])
                                                            }
                                                            port.write(data)   
                                                            await Promise.race([sleep(200), cancelPromise(port)]) 
                                                            if(reguest[0])      
                                                            if( reguest[0].query >= 2){
                                                                    console.error(data,'!timeout!')
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
                                               try{
                                                     if(port.isOpen)port.close()
                                             
                                                     if(proxyPort.isOpen)proxyPort.close()
                                     
                                                     await Promise.race([new Promise((resolve,reject)=>{ client.close(()=>{}) }),sleep(300)])
                                               }finally{
                                                     return}
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

export class TestDevicesModbus {
   

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

    private static modbusError( err, device:Device ){
       //if( device.errno != err.errno )
        pubsub.publish(LINK_STATE_CHENG, { deviceLinkState:{ _id:device._id, state:err.message }  });
        device.errno = err.errno 
        console.error('modbusError:',err)
    }



     static async onTrig( device:Device, rule:Rule ){
       // console.log(rule)
        if( rule && isArray(rule.acts)  ) 
        for( const act of rule.acts )
            {  
                
                if( act.email ){
                    let body = act.email.body
                     const bReg = body?this.parse(body):undefined
                     
                      if(bReg && body){
                        await  this.reguesting(bReg,client,device)
                          for(const reg of bReg){
                            body = body.replace(reg.pattern,'('+ reg.val + ')') 
                          }
                      }

                     sendMail( {...act.email,body:body}, device, device.rules.findIndex(_rule=>{return _rule===rule}) ); 
                }
                if( act.sms ){
                    let txt = act.sms.text
                    const regs = txt?this.parse(txt):undefined
                    
                     if(regs){
                       await  this.reguesting(regs,client,device)
                         for(const reg of regs){
                           txt = txt.replace(reg.pattern,'('+ reg.val + ')') 
                         }     
                        }
                    sendSMS({...act.sms,text:txt}, device) 
                }
                if(act.DO) act.DO.forEach((val,index,array)=>{
                    switch(val){
                        case 0:
                        case 1:io.setDO(io._do[index], val)
                        break
                        case 2:  io.setDO(io._do[index], 1)
                                 setTimeout( ()=>io.setDO(io._do[index], 0) ,1000)
                        break        
                        case 3:   io.setDO(io._do[index], 0)
                                 setTimeout( ()=>io.setDO(io._do[index], 1) ,1000)         
                    }
                   
                })
            } 
        
            //send SMSs Emails
    }
    private static  testTrig ( trig:Trig ){
       
            if( trig.condition  )
            if(trig.jsCode===undefined){

                trig.jsCode = trig.condition.replace(/\=+/g,' === ')
                                            .replace(/or/ig,'||')
                                            .replace(/and/ig,'&&')
                                            .replace(/not/g,'!')
                                            .replace(/<>/g,'!=')
                
            }
            let jsCode:string = trig.jsCode?trig.jsCode:'';
            if( trig && isArray(trig.regs) ){
             trig.regs.forEach(reg => {
                if( jsCode && reg  )
                    
                    jsCode = jsCode.replace(reg.pattern,'('+ reg.val + ')') 
                })}
                //const di:{pattern?:string, index?:number}[] = []  
               const result = (jsCode)=>{   try{
                    debug('jsCode:'+ jsCode)
                    return new Function('','return ('+jsCode+')')()    
                }catch(err){
                    console.error(err)
                    return false
                } 
            }
               
                const regExp:RegExp= new RegExp(/#DI?(\d+)/)
                if(regExp.test(jsCode)){               
                    let match = regExp.exec(jsCode)  
                    if(match) return io.di(io._di[parseInt(match[1])]).then((value)=>{
                            while (match){
                                jsCode = jsCode.replace(match[0],'('+ value +')')
                                match = regExp.exec(jsCode) 
                            }
                           return result(jsCode) 
                        }).catch((reason)=>console.error(reason)) 
                } 
                      
                 
}
        
    private static getSizeDataReguest(reg:Reg):number{
        if( reg.qualifier )
         if( reg.qualifier.search(/f/) ) return 2
         
        return 1
    }    
    private static processResponse(reg:Reg){
        switch(reg.qualifier){
            case 'u': reg.val = reg.val.buffer.readUInt16BE(0)
                return
           
           case'f':
                    if(reg.val.register.length === 2)
                
                         reg.val =  reg.val.buffer.readFloatBE(0)

                    else console.error('запрашивал 2 регистра получено не 2...  ')
                
            return               

            default: 
                 const bit = parseInt(reg.qualifier)
                 console.log(reg.pattern,'Bit:',bit,' val: ' ,reg.val) 
                 reg.val =  reg.val.buffer.readInt16BE(0) 
             
                 if(bit!==undefined && !isNaN(bit)){
                    reg.val = ((reg.val & (1<<bit)) >> bit )                   
                 }
        }
    }  
    static DNK4Data:Buffer
    static async getDNK4data(device:Device, client:ModbusRTU ){
       client.setID(device.mb_addr); 
       let val = await client.readHoldingRegisters(8, 42-8)
       {
          if( !val.buffer.equals(this.DNK4Data)){
            this.DNK4Data = val.buffer
            pubsub.publish(DNK4_UPD_VIEW, { updDNK4ViewData:{ device:device._id, buffer:val.data }  });
          }
       }
       

    }
    static async reguesting(regs,client:ModbusRTU,device:Device){
         // set ID of slave
        client.setID(device.mb_addr);
        for(const reg of regs){
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

            if(device)if(device.errno){pubsub.publish(LINK_STATE_CHENG, { deviceLinkState:{ _id:device._id, state:'' }  }); delete device.errno}
        }catch(err){
            if(device)this.modbusError(err,device)
        } 

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
                                await this.reguesting(trig.regs,client,device)
                               // debug('#trig.active:' + trig.active)
                                if( this.testTrig( trig ) ){ 
                                   debug('#trig.active:' + trig.active)
                                   if(!trig.active)trig.active=0
                                   if(trig.active < 6)++trig.active
                                   if( trig.active === 3 ) 
                                       await this.onTrig( device, rule )
                                }else  if(trig.active)--trig.active
                            }
                        }
                    }
                    
                }
            

     }
}

  
