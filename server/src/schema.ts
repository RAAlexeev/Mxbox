import gql from 'graphql-tag'
import * as fs from 'fs'
//import shortid from 'short-id'
//import * as zlib from 'zlib'
//import * as tar from 'tar-fs'
//import * as crypto from 'crypto'
import * as _APN from './APN'
import cmd  from 'node-cmd'

// The GraphQL schema
export  const typeDefs = gql(`\
    scalar Upload
    type Sms{
      enabled:Boolean
      numbers:[String]
      text:String 
    }
    type Email{
      enabled:Boolean
      address:String
      subject:String
      body:String
    }
   type Trig{
     type:Int!
     condition:String 
     sms:Sms 
     cron:String 
     coment:String
   }
   type Act{
     type:Int!
     sms:Sms
     email:Email
     DO:[Int]
   }
    type Rule{
      enabled:Boolean
      trigs:[Trig]
      acts:[Act]
    }
    input SmsInput{
      enabled:Boolean
      numbers:[String]
      text:String  
    }
   input EmailInput{
    enabled:Boolean
    address:String
    subject:String
    body:String
   }
    input TrigInput{
      enabled:Boolean
      type:Int!
      condition:String
      sms:SmsInput
      cron:String
      coment:String
    }
    input ActInput{
      type:Int!
      sms:SmsInput
      email:EmailInput
      DO:[Int]
    }
    input RuleInput{
        enabled:Boolean
    }
    type Device{
        name:String
        mb_addr: Int
        _id: ID!
        ip_addr: String
        rules:[Rule]! 
        type:Int
        mbAddrCorrect:Int
    }
    input DeviceInput{
      _id:ID
      name:String
      mb_addr:Int
      ip_addr:String
      rules:[RuleInput]
      type:Int
      mbAddrCorrect:Int
    }
    type  DeviceLinkState{
      _id:ID
      state:String
    } 
    type  ErrorMessages{
        message:String
    }   

    type UpdDNK4ViewData{
      _id:ID
      buffer:[Int]
    }
    type CREG{
      n:Int
      stat:Int
    } 
    type SignalGSM{
      value:Int
      CREG:CREG
    }
    type Subscription {
      deviceLinkState:DeviceLinkState
      errorMessages:ErrorMessages
      signalGSM:SignalGSM
      updDNK4ViewData(id:ID!):UpdDNK4ViewData
    }
    type Users{
      admin:String
      defaultUser:String
    }
    input SmtpConfInput{
      address:String
      port:Int
      name:String
      password:String
    }
    input PortConfInput{
      num:Int
      speed:Int
      param:String
      protocol:Int
      addr:Int
    }
    input APNconfInput{
      apn:String
      mcc:String
      mnc:String
      user:String
      password:String
    }
    input WiFiConfInput{
      SSID:String
      PSK:String
      TYPE:String
    }
    input UsersInput{
      username:String
      password:String
    }
    input SettingsInput{
      pingWatchDogEnable:Boolean
      maxCntReboot:Int
      users:UsersInput
      wifiOn:Boolean
      tz:Int
    }

    type Settings{
      pingWatchDogEnable:Boolean
      maxCntReboot:Int
      users:Users
      wifiOn:Boolean
    }
    type PortConf{
      num:Int
      speed:Int
      param:String
      protocol:Int
      addr:Int
    }
    type SmtpConf{
      address:String
      port:Int
      name:String
      password:String
    }
    type ApnConf{
      apn:String
      mcc:String
      mnc:String
      user:String
    }
    type WiFiConf{
      SSID:String
      PSK:String
      TYPE:String
    }
    type Directory {
      address:[String]
      numbers:[String]
    } 
    type IfaceInfo{
      address: String
      netmask: String
      family: String
      mac: String
      internal: Boolean
      cidr: String
    }
    type Ifaces{
      ap0:[IfaceInfo]
      ccmni0:[IfaceInfo]
      ccmni1:[IfaceInfo]      
      ccmni2:[IfaceInfo]      
    }
    type Info{
      io:[String]
      firmware:String
      ifaces:Ifaces
      ts:String
      uptime:Int
      hostname:String
      freemem:String
    }
    type Query {
      devices:[Device]
      rules(device:ID!):[Rule]
      device(id:ID!):Device
      templates:[Device]
      getDirectory:Directory
      getSettings:Settings
      getSmtpConfig:SmtpConf
      getPortsConfig:[PortConf]
      getAPNConfig:ApnConf
      getWiFiConfig:WiFiConf
      getInfo:Info
    }
    type Result{
      status:String

    }
    type File {
      filename: String!
      mimetype: String!
      encoding: String!
    }
    type Mutation{
      setTZ(tz:Int!):Boolean
      singleUpload(file: Upload!): File
      settingsUpload(file:Upload!):File!
      addAsTemplate(_id:ID!):Result
      delTemplate(_id:ID!):Result
      addDevice(device:DeviceInput!):Device
      updDevice(deviceInput:DeviceInput!):Result
      delDevice(_id:ID):Result
      addRule(device:ID!):Result
      updRule(device:ID!,ruleInput:RuleInput!,num:Int!):Rule
      delRule(device:ID!,ruleNum:Int!):Result
      addTrig(device:ID!,trigInput:TrigInput!,ruleNum:Int!):Result
      updTrig(device:ID!,ruleNum:Int!,trigNum:Int!,trigInput:TrigInput):Result
      delTrig(device:ID!,ruleNum:Int!,trigNum:Int!):Result 
      addAct(device:ID!,actInput:ActInput!,ruleNum:Int!):Result
      updAct(device:ID!,ruleNum:Int!,actNum:Int!,actInput:ActInput):Act!
      delAct(device:ID!,ruleNum:Int!,actNum:Int!):Result 
      addFromTemplate(device:ID!,template:ID!):[Rule]
      setSmtpConfig( smtpConf:SmtpConfInput! ):Result
      setPortConfig( portConf:PortConfInput! ):Result
      setAPNconfig(APNconf:APNconfInput! ):Result
      setWiFiConfig(WiFiConf:WiFiConfInput! ):Result
      exchangeNum( sNum:String, dNum:String sEmail:String, dEmail:String):Result
      ping(ip_addr:String):String
      switch_io_test:Boolean
      setSettings(settings:SettingsInput!):Result
      tested(sms:SmsInput, email:EmailInput):Result
      sendSmsPass(name:String,pwd:String):Result
    }
`);

import * as Datastore from 'nedb';

export var db = new Datastore({filename : '/data/mxBox/DB/db'});
 var db_template = new Datastore({filename : '/data/mxBox/DB/db_template'});
export var db_settings = new Datastore({filename : '/data/mxBox/DB/db_settings'});

db.loadDatabase();

export interface Sms{
  numbers:Array<string>
  text:string
}
export interface Email{
  address:string
  subject:string
  body?:string
}
export interface Trig{
   active: number 
   notice: number
  type:number
  condition?:string
  sms?:Sms
  email?:Email
  cron?:string
  regs?:any
}
export interface Act{
  type:number
  sms?:Sms
  email?:Email
  DO?:number[]
}
export interface Rule {
  trigs?:Array<Trig>
  acts?:Array<Act>
}
export interface Device{
  
  _id:string
  name:string 
  mb_addr:number
  ip_addr:string
  rules:Rule[]
  errno?:string
  mbAddrCorrect?:number
}
// A map of functions which return data for the schema.
/* interface DeviceInput{
  name
  mb_addr
  ip_addr?
}
class Device implements DeviceInput{
    _id
    name:'новое'
    mb_addr:1
    ip_addr?
  constructor(device){
    //console.log('addDevice.constructr:(' + util.inspect(device)+')')
    this._id = device._id
    this.name = device.name
    this.mb_addr = device.mb_addr
    if(device.ip_addr)
      this.ip_addr = device.ip_addr

  }
} */
//import * as util from 'util'

import { PubSub, makeExecutableSchema, withFilter } from 'apollo-server-express'
import { reloadCronTask } from './tests.devices/cron.test'
import { isArray, isObject } from 'util'
import { getStateIO } from './io'
import { dioTest } from './tests.devices/dio.test'
import { sendSMS } from './tests.devices/result/send.sms'
import { sendMail } from './tests.devices/result/send.email'
import { pingWatchDog } from './ping'
import { wifiOnTimeout } from './app-server'
export const LINK_STATE_CHENG = 'LINK_STATE_CHENG'
export const ERROR_MESSAGES = 'ERROR_MESSAGES'
export const SIGNAL_GSM = 'SIGNAL_GSM'
export const DNK4_UPD_VIEW = 'UPV'
export const pubsub = new PubSub();
var mutated = 0
export const isMutated = (_mutated?:boolean)=>{
  if(_mutated)mutated +=2
  else  if( mutated )mutated--
     return mutated}
     var reinit = 0
export const portReinit =(_reinit?:boolean )=>{


      if(_reinit)reinit+=2
      else  if(reinit )reinit--
      
      return reinit
    }

export const devicesSubscribed=[0]
export const resolvers = {
 // Upload: GraphQLUpload,
   Subscription:{
    errorMessages:{
      subscribe:(parent, args)=>pubsub.asyncIterator([ERROR_MESSAGES])
    },
    deviceLinkState:{
      subscribe:(parent, args)=>pubsub.asyncIterator([LINK_STATE_CHENG])
    },
    signalGSM:{
      subscribe:(parent, args)=>pubsub.asyncIterator([SIGNAL_GSM])
    },
    updDNK4ViewData:{
      subscribe:  withFilter((parent, args)=>{ console.dir('subscribe' ,args ); devicesSubscribed.push(args._id); return pubsub.asyncIterator([DNK4_UPD_VIEW])},(payload, variables) => {console.log(payload, variables);return payload.ID == variables.ID;  })
    }
   
  } ,
  Query: {
    devices: (parent) => {
      var callback = function(err, dev){ if( err ){ console.log(err); this.reject(err)} else{ this.resolve(dev)} }         
      const p = new Promise((resolve, reject)=>{db.find( {}, callback.bind({resolve,reject}) )})    
      return p.then().catch()   
    },
    rules: (parent, args) => {
      db.update({},{$pull:{'rules':null}},{multi:true})
      db.update({},{$pull:{'rules.trigs':null}},{multi:true})
      db.update({},{$pull:{'rules.acts':null}},{multi:true})
      var callback = function(err,dev){   /*console.log("callback(",dev,")"); */  if( err ){ console.log(err); this.reject(err)} else this.resolve(((dev[0]&&dev[0].rules)?dev[0].rules:[])) }         
      const p = new Promise((resolve,reject)=>{db.find( {_id:args.device }, callback.bind({resolve,reject}))})   

      return p.then().catch()   
    },  
    templates: (parent, args)=>{
      db_template.loadDatabase();
      db_template.update({},{$pull:{'rules':null}},{multi:true})
      db_template.update({},{$pull:{'rules.trigs':null}},{multi:true})
      db_template.update({},{$pull:{'rules.acts':null}},{multi:true})
      var callback = function(err,devices){   /*console.log("callback(",dev,")"); */  if( err ){ console.log(err); this.reject(err)} else this.resolve(devices) }         
      const p = new Promise((resolve,reject)=>{db_template.find( {}, callback.bind({resolve,reject}))})    
      return p.then().catch()   
    },
    getDirectory:(parent, args)=>{
      var callback = function(err,devs:Array<Device>){ 
                                        if( err ){ console.log(err); this.reject(err.toString())} 
                                        else { 
                                          let emails:Array<string> = []
                                          let numbers:Array<string> = []
                                           devs.forEach(dev =>{ 
                                             dev.rules.forEach(rule => {
                                                if(rule && isArray(rule.acts)){
                                                  for(const act of rule.acts ) if(act){                                                   
                                                      if( act.sms ) act.sms.numbers.forEach(number=>{ if(number)numbers.push( number )})
                                                      if( act.email ) act.email.address.split(';').forEach(addr=> {if(addr)emails.push( addr )})
                                                  }
                                                }
                                             }) 
                                          })
                                          numbers =  [ ... new Set(numbers)]
                                          emails = [... new Set(emails)]
                                              console.log("!!!!!",{numbers:numbers, address:emails})
                                              this.resolve({ numbers:numbers, address:emails })                                         
                                        } 
                                      }         
      const p = new Promise((resolve,reject)=>{db.find( {'rules.trig.email.address':{$ne:null},'rules.trig.sms.numbers':{$ne:null}}, callback.bind({resolve,reject}))})    
      return p.then().catch()   
    },
    getSmtpConfig:(parent, args)=>{
      db_settings.loadDatabase()
      var callback = function(err,conf){ if( err ){ console.log(err); this.reject(err)} else this.resolve(conf) }         
      const p = new Promise((resolve,reject)=>{db_settings.findOne( {_id:'smtp'}, callback.bind({resolve, reject}))})    
      return p.then().catch()   
    },
    getPortsConfig:(parent, args)=>{
      db_settings.loadDatabase()
      var callback = function(err,conf){ if( err ){ console.log(err); this.reject(err)} else if(conf) this.resolve( [conf["0"]?conf["0"]:null, conf["1"]?conf["1"]:null] ); else this.reject({message:'no data'}) }         
      const p = new Promise((resolve,reject)=>{db_settings.findOne( {_id:'portsSettings'}, callback.bind({resolve, reject} ))})    
      return p.then().catch()   
    },
    getAPNConfig:(paren,args)=>{
           return _APN.getAPN()
    },
    getWiFiConfig:(paren,args)=>{
      db_settings.loadDatabase()
      var callback = function(err,conf){ if( err ){ console.log(err); this.reject(err)} else if(conf) this.resolve(conf); else this.reject('no WiFiSettings') }         
      const p = new Promise((resolve,reject)=>{db_settings.findOne( {_id:'WiFiSettings'}, callback.bind({resolve, reject} ))})    
      return p.then().catch() 
    },
    getInfo:async ()=>{
      const getDateTime=()=>{
      // let ts = Date.now();
        let date_ob = new Date();
        // current hours
        let hours = date_ob.getHours();
        // current minutes
        let minutes = date_ob.getMinutes();
        // current seconds
        let seconds = date_ob.getSeconds();
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        return year + "-" + month + "-" + date + '@'+hours+':'+minutes+':'+ seconds
      }
      const os = require('os');
       let io
      try{
      io = await getStateIO()
      }catch(err){
        console.error(err)
        io=[]
      }finally{
          return{
                ts: getDateTime(),
                ifaces : os.networkInterfaces(),
                firmware :'[AIV]{version}[/AIV]',
                uptime : os.uptime(),
                hostname : os.hostname(),
                freemem : os.freemem(),
                io :  io
          }
      }
    },
    getSettings:()=>{
      db_settings.loadDatabase()
      var callback = function(err,conf){ if( err ){ console.log(err); this.reject(err)} else if(conf){console.dir(conf); this.resolve(conf); }else this.reject('no settings') }         
      const p = new Promise((resolve,reject)=>{db_settings.findOne( {_id:'settings'}, callback.bind({resolve, reject} ))})    
      return p.then().catch() 
    },
  },

  Mutation:{
      addDevice(parent,args,context,info){          
            var callback = function( err, dev){ if( err ){ console.log(err); this.reject(err)} else{  this.resolve(dev)} }  
            if(!args.device.rules)  args.device.rules = []       
            const p = new Promise((resolve,reject)=>{db.insert( args.device, callback.bind({resolve,reject}))})    
            return p.then().catch()     
       },
      updDevice(parent,args,context,info){
          var callback = function(err, numAffected, affectedDocuments, upsert){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err); this.reject(err)} else{ isMutated(true); this.resolve("OK")} }         
          const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.deviceInput._id}, {$set:args.deviceInput}, {}, callback.bind({resolve,reject}))})    
          return p.then().catch()    
      },
      delDevice(parent,args,context,info){
        var callback = function(err, cnt ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err); this.reject({status:err})} else{isMutated(true);  this.resolve({status:"OK"})} }         
        const p = new Promise((resolve,reject)=>{db.remove({_id:args._id}, callback.bind({resolve,reject}))})    
        return p.then().catch()    
      },

      addRule(parent,args,context,info){
        var callback = function(err, device ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err); this.reject({status:err.toString()})} else{  this.resolve({status:device?'OK':'not found'})} }         
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, {$push:{rules:{enabled:false, trigs:[], acts:[]}}},{}, callback.bind({resolve,reject}))})    
        return p.then().catch()    
      },

      updRule(parent,args,context,info){
        var callback = function(err, device ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err); this.reject({status:err})} else{ isMutated(true); this.resolve({status:device?'OK':'not found'}) }}      
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, args.ruleInput, {}, callback.bind({resolve,reject}))})    
        return p.then().catch()    
      },
      delRule(parent,args,context,info){
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err); this.reject({status:err})} else{ isMutated(true); reloadCronTask(); this.resolve({status:"OK:"+numberUpdated}) }}        
        const p = new Promise((resolve,reject)=>{db.update({_id:args.device},{$unset:{['rules.'+args.ruleNum]:undefined}},{}, callback.bind({resolve,reject}))})    
        return p.then().catch()    
      },     
      addTrig(parent,args,context,info){
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else{   this.resolve({status:'OK:'+numberUpdated}) }}            
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, {$push:{['rules.'+args.ruleNum+'.trigs']:args.trigInput}}, {}, callback.bind({resolve,reject}))})    
        return p.then((v)=>v).catch((v)=>v)    
      },
      updTrig(parent,args,context,info){
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else{
                                                                  switch(args.trigInput.type){case 1:reloadCronTask(); break; default:isMutated(true); } this.resolve({status:'OK:'+numberUpdated}) }}            
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, {$set:{['rules.'+args.ruleNum+'.trigs.'+ args.trigNum]:args.trigInput}}, {}, callback.bind({resolve,reject}))})    
        return p.then((v)=>v).catch((v)=>v)    
      },
      delTrig(parent,args,context,info){
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else{isMutated(true);reloadCronTask();  this.resolve({status:'OK:'+numberUpdated}) }}            
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, {$unset:{['rules.'+args.ruleNum+'.trigs.'+ args.trigNum]:undefined}}, {}, callback.bind({resolve,reject}))})    
        return p.then((v)=>v).catch((v)=>v)    
      },
           
      addAct(parent,args,context,info){
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else{  this.resolve({status:'OK:'+numberUpdated}) } }           
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, {$push:{['rules.'+args.ruleNum+'.acts']:args.actInput}}, {}, callback.bind({resolve,reject}))})    
        return p.then((v)=>v).catch((v)=>v)    
      },
      updAct(parent,args,context,info){
        var callback = function(err, numberUpdated, affectedDocuments ){ console.log("callback(",affectedDocuments.rules[args.ruleNum].acts,")");  if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else if(numberUpdated){ isMutated(true);  this.resolve(affectedDocuments.rules[args.ruleNum].acts[args.actNum]); }else this.resolve(null) }            
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, {$set:{['rules.'+args.ruleNum+'.acts.'+ args.actNum]:args.actInput}}, {returnUpdatedDocs:true}, callback.bind({resolve,reject}))})    
        return p.then((v)=>v).catch((v)=>v)    
      },
      delAct(parent,args,context,info){
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else{isMutated(true); this.resolve({status:'OK:'+numberUpdated}) }}
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, {$unset:{['rules.'+args.ruleNum+'.acts.'+ args.actNum]:undefined}}, {}, callback.bind({resolve,reject}))})    
        return p.then((v)=>v).catch((v)=>v)    
      },
      exchangeNum(parent,{sNum, dNum,sEmail,dEmail},context,info){
     //replaceFileText(sNum,dNum,'DB/db')
     console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',sNum,dNum)
         var callback = function( err, devices:Device[]){
          let cnt = 0
          if(err){ console.error(err); this.reject({status:err.message})} 
          else
          { 
            let update = false
            for(const dev of devices){
              for(const rule of dev.rules)if(rule){
                if(rule.acts)
                  for(const act of rule.acts){
                    if(act && act.sms && sNum && dNum)
                      act.sms.numbers = act.sms.numbers.map((val,ind,arr)=>{ if(val!=sNum)return val; else{update = true; ++cnt; return dNum}}) as string[]   
                      if(act && act.email && sEmail && dEmail) 
                      act.email.address=act.email.address.replace(sEmail,dEmail)
                  }
                  if(rule.trigs)
                  for(const trig of rule.trigs){
                    if(trig && trig.sms)
                      trig.sms.numbers = trig.sms.numbers.map((val,ind,arr)=>{ if(val!=sNum)return val; else{update = true; ++cnt; return dNum}}) as string[]
                      if(trig && trig.email && sEmail && dEmail) 
                      trig.email.address=trig.email.address.replace(sEmail,dEmail)
                  }
              }
              if(update){     
                db.update({_id:dev._id},{$set:{rules:dev.rules}},{},(err)=>{if(err)console.error(err);})
                update = false
              }
            }
     
            isMutated(true); this.resolve({status:`Заменено: ${cnt}`})} 
          }         

      //  if(args.sNumber === args.dNumber)return {status:`Заменено: 0 номеров`}
         const p = new Promise((resolve,reject)=>{db.find<void>({},  callback.bind({resolve,reject}) )})
         return p.then().catch()    
      },
       addAsTemplate(parent,args,context,info){
           db_template.loadDatabase();
        var callback = function(err, device){ 
          if(err) {
            console.log(err); this.reject({status:err.toString()})
          }else
          if(device){
            
           db_template.update({_id:device._id},device,{upsert:true},function(err,numberUpdates){
              if(err){
                console.error(err); this.reject({status:err.toString()})
              } else {
                console.log("OK:",numberUpdates)
                isMutated(true);
                             this.resolve(device)
              }
            }.bind(this))
          }else{
          console.log(device); this.reject({status:'not found device'})
         } 
        }        
        const p = new Promise((resolve,reject)=>{
          db.findOne({_id:args._id},callback.bind({resolve,reject}))
        //  db.update<void>({_id:args.device}, {$push:{rules:{enabled:false}}},{}, callback.bind({resolve,reject}))
        })    
        return p.then((v)=>v).catch((v)=>v)    
      }, 
      delTemplate(parent,args,context,info){
        db_template.loadDatabase();
        var callback = function(err, numberRemoved ){/* console.log("callback(",arguments,")"); */ 
        if(err){ console.log(err); this.reject({status:err})} else this.resolve({status:"OK:"+numberRemoved}) }         
        const p = new Promise((resolve, reject)=>{db_template.remove({_id:args._id},callback.bind({resolve,reject}))})    
        return p.then().catch()    
      },
      addFromTemplate(parent,args,context,info){
      db_template.loadDatabase();
      var callback = function(err, template){ 

        if(err) {
          console.log(err); this.reject({status:err.toString()})
        }else
        if(template){
            db.update({_id:args.device},{$push:{rules:{$each:template.rules}}}, function(err, numberUpdates, devices){
            if(err){
              console.error(err); this.reject({status:err.toString()})
            } else {
              console.log("OK:", template)
            //  modbusTestRun()
              this.resolve(template.rules)
            }
          }.bind(this))
        }else{
        console.log('template not found', args.template); this.reject('template not found')
       } 
      }        
      const p = new Promise((resolve,reject)=>{
        db_template.findOne({_id:args.template},callback.bind({resolve,reject}))
      })    
      return p.then((v)=>v).catch((v)=>v)    
    },

    setSmtpConfig(parent,args,context,info){
        db_settings.loadDatabase()
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else this.resolve({status:'OK:'+numberUpdated}) }            
        const p = new Promise((resolve, reject)=>{db_settings.update<void>({_id:'smtp'},{$set:args.smtpConf} , {upsert:true}, callback.bind({resolve,reject}))})    
        return p.then((v)=>v).catch((v)=>v)   
    },
    setPortConfig(parent,{portConf},context,info){
      db_settings.loadDatabase()
      var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.error(err); this.reject({status:err.toString()})} else{ portReinit(true); this.resolve({status:'OK:'+numberUpdated}) }}            
      const p = new Promise((resolve,reject)=>{db_settings.update<void>({_id:'portsSettings'},{$set:{[portConf.num]:portConf}} , {upsert:true}, callback.bind({resolve,reject}))})    
      return p.then((v)=>v).catch((v)=>v)   
    },
    setAPNconfig(parent,APN,context,info){
     return _APN.setAPN(APN.APNconf).then().catch()
    },
    setWiFiConfig(parent,{ WiFiConf },context,info){

      fs.writeFile("/data/misc/wifi/wpa_supplicant.conf",`ctrl_interface=/data/misc/wifi/sockets
driver_param=use_p2p_group_interface=1
update_config=1
device_name=hexing72_cwet_lca
manufacturer=alps
model_name=E8 plus
model_number=E8 plus
serial_number=0123456789ABCDEF
device_type=10-0050F204-5
os_version=01020300
config_methods=physical_display virtual_push_button
p2p_no_group_iface=1
network={
         ssid="${WiFiConf.SSID}"
         psk="${WiFiConf.PSK}"
         key_mgmt=WPA-PSK
         sim_slot="-1"
         imsi="none"
         priority=2
}
`,(err)=>err?console.error(err):cmd.run("chown system:wifi  /data/misc/wifi/wpa_supplicant.conf"));
      db_settings.loadDatabase()
      var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.error(err); this.reject({status:err.toString()})} else{ this.resolve({status:'OK:'+numberUpdated}) }}            
      const p = new Promise((resolve,reject)=>{db_settings.update<void>({_id:'WiFiSettings'},{$set:WiFiConf} , {upsert:true}, callback.bind({resolve,reject}))})    
      return p.then((v)=>v).catch((v)=>v)   
     },

     ping(parent,{ip_addr},info){
      const p = new Promise((resolve,reject)=>cmd.get("ping -c3 "+ip_addr,(err,data,stderr)=>{
        if(err)reject(err)
         else{
          if(data)
          resolve(data) 
          else
          resolve(stderr) 
         } 
        }))
        return p.then().catch()   
     },
     switch_io_test(){
        return dioTest()     
     },
     setTZ(parent,{tz}){
      console.log('tz:',tz)
      cmd.run('settings put global auto_time_zone 0 && setprop persist.sys.timezone "Etc/GMT'+tz+'"')
      return true
   },
     setSettings(parent,{settings},context,info){
       if(settings.users){

          settings.users ={[settings.users.username]:settings.users.password}
      }
      db_settings.loadDatabase()
     if(settings.hasOwnProperty('pingWatchDogEnable'))
      pingWatchDog.enable=settings.pingWatchDogEnable
      if(settings.hasOwnProperty('wifiOn')&& settings.wifiOn)
        clearTimeout( wifiOnTimeout )
      var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.error(err); this.reject({status:err.toString()})} else{ this.resolve( pingWatchDog.enable) }}            
      const p = new Promise((resolve,reject)=>{db_settings.update<void>({_id:'settings'},{$set:settings} , {upsert:true}, callback.bind({resolve,reject}))})    
      return p.then((v)=>v).catch((v)=>v)   
   },
     tested(parent,{sms,email},info){
       try{
          if(sms) return {status:sendSMS(sms)}
          if(email) sendMail(email)
          return {status:''}
       }catch(err){
        return err//{status:err.message}
       } 
     },
     sendSmsPass(num,pass){
      sendSMS({numbers:[num],text:pass}) 
     }
     
  }   
}

export  default makeExecutableSchema({
  typeDefs,
  resolvers,
});