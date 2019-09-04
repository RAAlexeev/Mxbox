import gql from 'graphql-tag'
import * as fs from 'fs'
import shortid from 'short-id'
import * as zlib from 'zlib'
import * as tar from 'tar-fs'
import * as crypto from 'crypto'
// The GraphQL schema
 export const typeDefs = gql(`\
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
     inSms:Sms 
     inEmail:Email
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
      inSms:SmsInput
      inEmail:EmailInput
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
    }
    input DeviceInput{
      _id:ID
      name:String
      mb_addr:Int
      ip_addr:String
      rules:[RuleInput]
    }
    type  DeviceLinkState{
      _id:ID
      state:String
    }  
    type UpdDNK4ViewData{
      _id:ID
      pumps:[Int]
      levels:[Int]
    }

    type Subscription {
      deviceLinkState:DeviceLinkState
      updDNK4ViewData(id:ID):UpdDNK4ViewData
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
    }
    type PortConf{
      num:Int
      speed:Int
      param:String
      protocol:Int
    }
    type SmtpConf{
      address:String
      port:Int
      name:String
      password:String
    }
    type Directory {
      address:[String]
      numbers:[String]
    } 
    type Query {
      devices:[Device]
      rules(device:ID!):[Rule]
      device(id:ID!):Device
      templates:[Device]
      getDirectory:Directory
      getSmtpConfig:SmtpConf
      getPortsConfig:[PortConf]
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
      
      singleUpload(file: Upload!): File!
  
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
      exchangeNum( sNum:String, dNum:String ):Result
    }
`);
 
import * as Datastore from 'nedb';

export var db = new Datastore({filename : 'db'});

 var db_template = new Datastore({filename : 'db_template'});
export var db_settings = new Datastore({filename : 'db_settings'});

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

import  { PubSub, makeExecutableSchema, withFilter } from 'apollo-server-express'
export const LINK_STATE_CHENG = 'LINK_STATE_CHENG'
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
export const resolvers = {
  Subscription:{
    deviceLinkState:{
      subscribe:(parent, args)=>pubsub.asyncIterator([LINK_STATE_CHENG])
    },
    updDNK4ViewData:{
      subscribe:withFilter((parent, args)=>{ console.dir('subscribe' ,args ); return pubsub.asyncIterator([DNK4_UPD_VIEW])},(payload, variables) => { variables.ID; return true})
    }
   
  } ,
  Query: {
    devices: (parent) => {
      var callback = function(err, dev){ if( err ){ console.log(err); this.reject(err)} else{ this.resolve(dev)} }         
      const p = new Promise((resolve,reject)=>{db.find( {}, callback.bind({resolve,reject}))})    
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
                                                if( rule.acts )rule.acts.forEach(act => {                                                   
                                                      if( act.sms ) act.sms.numbers.forEach(number=>{ if(number)numbers.push( number )})
                                                      if( act.email ) act.email.address.split(';').forEach(addr=> {if(addr)emails.push( addr )})
                                                  })
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
      var callback = function(err,conf){ if( err||conf===undefined){ console.log(err); this.reject(err)} else this.resolve( [conf["0"]?conf["0"]:null, conf["1"]?conf["1"]:null] ) }         
      const p = new Promise((resolve,reject)=>{db_settings.findOne( {_id:'portsSettings'}, callback.bind({resolve, reject} ))})    
      return p.then().catch()   
    }
    
  },
  Mutation:{
    async singleUpload(parent, args)  {
      
      console.dir(args)
      const f  = await args.file;
      const { stream , filename, mimetype, encoding } =  f;
      const key = Buffer.from('DD40F61878B23CFF441652518DB6BF7F11C6AC997CEEBDEFABFEC02A9F532CAF','hex')
      const iv = Buffer.from('03E5254B8166E4BA1E27B07FE831064F', 'hex')
      console.log(key,'/',iv)
      const ungzip = zlib.createGunzip();
      const decipher = crypto.createDecipheriv('aes-256-cbc' ,key,  iv);
      const storeFS = ({ stream, filename }) => {
        const id = shortid.generate()
        const path = `./uploads/${id}-${filename}`
        return new Promise((resolve, reject) =>
          stream
            .on('error', error => {
              if (stream.truncated)
                // Delete the truncated file.
                fs.unlinkSync(path)
              reject(error)
            })
            .pipe(decipher)
            .pipe(ungzip)
            .pipe(tar.extract('./upload/mxBox'))
            //.pipe(fs.createWriteStream(path))
            .on('error', error => reject({error}))
            .on('finish', () => resolve({ id, filename }))
        )
      }
     
      return  await storeFS({stream,filename})
      
      },
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
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err); this.reject({status:err})} else{ isMutated(true); this.resolve({status:"OK:"+numberUpdated}) }}        
        const p = new Promise((resolve,reject)=>{db.update({_id:args.device},{$unset:{['rules.'+args.ruleNum]:undefined}},{}, callback.bind({resolve,reject}))})    
        return p.then().catch()    
      },     
      addTrig(parent,args,context,info){
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else{   this.resolve({status:'OK:'+numberUpdated}) }}            
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, {$push:{['rules.'+args.ruleNum+'.trigs']:args.trigInput}}, {}, callback.bind({resolve,reject}))})    
        return p.then((v)=>v).catch((v)=>v)    
      },
      updTrig(parent,args,context,info){
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else{isMutated(true); this.resolve({status:'OK:'+numberUpdated}) }}            
        const p = new Promise((resolve,reject)=>{db.update<void>({_id:args.device}, {$set:{['rules.'+args.ruleNum+'.trigs.'+ args.trigNum]:args.trigInput}}, {}, callback.bind({resolve,reject}))})    
        return p.then((v)=>v).catch((v)=>v)    
      },
      delTrig(parent,args,context,info){
        var callback = function(err, numberUpdated ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err.toString()); this.reject({status:err.toString()})} else{isMutated(true);  this.resolve({status:'OK:'+numberUpdated}) }}            
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
      exchangeNum(parent,args,context,info){
        var callback = function(err, numAffected, affectedDocuments, upsert){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err); this.reject(err)} else{ isMutated(true); this.resolve("OK")} }         
        if(args.sNumber == args.dNumber)return
        const p = new Promise((resolve,reject)=>{db.update<void>({'trigs.sms.numbers':{$in:args.sNumber}}, {$addToSet:{'trig.sms.numbers':args.dNumbers}, $pull:{'trig.sms.numbers':args.dNumbers}}, {multi:true}, callback.bind({resolve,reject}) )})
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
        var callback = function(err, numberRemoved ){/* console.log("callback(",arguments,")"); */ if(err){ console.log(err); this.reject({status:err})} else this.resolve({status:"OK:"+numberRemoved}) }         
        const p = new Promise((resolve,reject)=>{db_template.remove({_id:args._id},callback.bind({resolve,reject}))})    
        return p.then().catch()    
      },
      addFromTemplate(parent,args,context,info){
      db_template.loadDatabase();
      var callback = function(err, template){ 

        if(err) {
          console.log(err); this.reject({status:err.toString()})
        }else
        if(template){
            db.update({_id:args.device},{$push:{rules:{$each:template.rules}}}, function(err,numberUpdates, devices){
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
      const p = new Promise((resolve,reject)=>{db_settings.update<void>({_id:'portsSettings'},{$set:{[portConf.num? portConf.num:"0"]:portConf}} , {upsert:true}, callback.bind({resolve,reject}))})    
      return p.then((v)=>v).catch((v)=>v)   
    }
  }   
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});