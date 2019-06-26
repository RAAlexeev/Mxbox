import ModbusRTU from '../../node_modules/modbus-serial'
import { db, pubsub, LINK_STATE_CHENG, Device, isMutated, portReinit, db_settings } from '../schema' 
import { sendMail } from './result/send.email'
import { sendSMS } from './result/send.sms';
import { debug } from 'util';



export const modbusTestRun = ()=>{
 
        db.find( { 'rules.trigs.type':0 }
            ,async( err,  devices:Device[] )=>{
                     try{
                        if(!err){  
                            const client = new ModbusRTU();
                          
                            db_settings.loadDatabase();
                            db_settings.findOne( { '_id':'port1' }
                                  ,async( err,  settings:{speed:number;param:string} )=>{

                                if(err) {
                                    console.error(err)
                                    settings={speed:19200, param:'8e1'}
                                }
                               const parity=()=>{switch(settings.param[1]){
                                    case 'e': return 'even' //'none' | 'even' | 'mark' | 'odd' | 'space'
                                    case 'o': return 'odd'
                                    case 'n': return 'none'
                                    case 's': return 'space'
                                    }
                                }
                                  // open connection to a serial port
                                        
                                        await client.connectRTUBuffered("/dev/ttyMT1", { baudRate: settings.speed, parity:parity(),stopBits: parseInt(settings.param[2]) });
                                        // set timeout, if slave did not reply back
                                        client.setTimeout(1000);
                                    
                                
                                        const queryDevices = async (devices) => {
                                            try{
                                                // get value of all meters
                                                for(let device of devices) {
                                                    // output value to console
                                                    await queryDevice(device)
                                                    // wait 100ms before get another device
                                                    await sleep(5000);
                                            }
                                            } catch(e){
                                                // if error, handle them here (it should not)
                                                console.log(e)
                                            } finally {
                                                if(portReinit()) 
                                                    client.close(
                                                        ()=>{
                                                            modbusTestRun()
                                                            return
                                                        }
                                                    )
                                                else
                                                if(isMutated())
                                                db.find( { 'rules.trigs.type':0 }
                                                    ,( err, devices:Device[] )=>{  
                                                    // after get all data from salve repeate it again
                                                    if(!err)
                                                        setImmediate(() => {
                                                            queryDevices(devices);
                                                        })
                                                    else console.error(err)
                                                })
                                                else  queryDevices(devices)
                                            }
                                        }
                                        
                                        const queryDevice = async (device:Device) => {
                                            try {
                                                // set ID of slave
                                                await client.setID(device.mb_addr);
                                                // read the 1 registers starting at address 0 (first register)
                                                await TestDevicesModbus.testTrigs(device, client) 
                                                // return the value
                                                
                                            } catch(e){
                                                // if error return -1
                                                console.error(e)
                                            }
                                        }
                                        
                                        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                                        
                                        
                                        // start get value
                                        queryDevices(devices)
                            })
                        } else console.error(err.toString())
                    }catch(e){
                        console.error(e)
                     }
                        })
                        

}

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
            console.error(err.toString())
    }


    private static onTrig( device:Device, rule:Rule ){
     
        if( rule && rule.acts ) 
        for(const act of rule.acts)
            {  if( act.email ) sendMail( device, act.email, device.rules.findIndex(_rule=>{return _rule===rule}) ); 
                if(act.sms) sendSMS(act.sms, device) 
            } 
        
            //send SMSs Emails
    }
    private static testTrig ( trig:Trig ):boolean{
            
            if( trig.condition  )
            if(trig.jsCode===undefined){

                trig.jsCode = trig.condition.replace(/\=+/g,' === ')
                                            .replace(/or/ig,'|')
                                            .replace(/and/ig,'&')
                                            .replace(/not/g,'!')
                                            .replace(/<>/g,'!=')
                
            }
            let jsCode = trig.jsCode
            if( trig && trig.regs ){
             trig.regs.forEach(reg => {
                if( jsCode && reg && reg.val )
                    
                    jsCode = jsCode.replace(reg.pattern,'('+ reg.val + ')') 
                })
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
        if ( !reg.qualifier ) {
           reg.val =new Int16Array( reg.val.data )[0] 
        } else 
            if(reg.qualifier.search(/u/)){
                 reg.val = reg.val.data[0]
            }else
                if(this.getSizeDataReguest(reg) === 2){
                    if(reg.val.register.length === 2)
                
                         reg.val =  new Float32Array(new Uint16Array(reg.val.data).buffer)[0]

                    else console.error('запрашивал 2 регистра получено не 2...  ')
                }else{          
               const bit = parseInt(reg.qualifier)
               reg.val = ((reg.val.data[0] & (1<<bit)) >> bit )         
            }
        
    }    
    static async testTrigs ( device:Device, client:ModbusRTU ){
            for( const rule of device.rules) {
                if(rule && rule.trigs)
                  for(const trig of  rule.trigs){
                        if(trig){
                            if ( trig.condition ){
                                trig.regs =  this.parse(trig.condition)
                                for(const reg of trig.regs){
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
                                }
                               // debug('#trig.active:' + trig.active)
                                if( this.testTrig( trig ) ){ 
                                   debug('#trig.active:' + trig.active)
                                   if(!trig.active)trig.active=0
                                   if(trig.active < 12)++trig.active
                                   if( trig.active === 6 ) 
                                        this.onTrig( device, rule )
                                }else  if(trig.active)--trig.active
                            }
                        }
                    }
                    
                }
            

     }
}

  
