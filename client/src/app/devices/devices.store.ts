import { observable, action, runInAction, computed } from 'mobx'
import gql from 'graphql-tag'
import { AppStore } from '../app.store'
import { arrayRemove } from '../utils';
import { Rule, RulesStore } from '../rules/rules.store';
import { isUndefined } from 'util';
import { ObservableArray } from 'mobx/lib/types/observablearray';

const DevicesQuery = gql`
  query DevicesQuery {
    devices
    {
      _id,
      name,
      mb_addr,
      ip_addr,
      type,
      mbAddrCorrect
    }
  }
`
const addDevice = gql`
mutation addDevice( $mb_addr:Int ){
  addDevice(device:{name:"Новое", ip_addr:"127.0.0.1:501", mb_addr:$mb_addr}){
    _id, name,  ip_addr, mb_addr
  }
}
`


export interface Device {
  _id: string
  name: string
  mb_addr?: number
  ip_addr?: string
  rules?: Array<Rule> 
  error?:string
  type?:number
  mbAddrCorrect?:Boolean
}

interface DevicesQueryResult {
  devices?: Array<Device>
  device?:Device
  data?

}

export class DevicesStore {
  static instance: DevicesStore
  appStore: AppStore
  rulesStore:RulesStore
 // deviceSubscription

  @observable devices = observable.array([], "devices") 
  @observable selected: Device
   
  @observable isEdit:boolean = false
  deviceSubscription;
  
   constructor() {
    this.initializeDevices()
    let self = this
    this.appStore = AppStore.getInstance()
    this.isEdit = false


      this.deviceSubscription = this.appStore.apolloClient.subscribe({
      query: gql`subscription onDeviceLinkState{
        deviceLinkState{
          _id,
          state
        }
      }`,
      variables: { }
    }).subscribe({
      next:({data})=> {
       const {deviceLinkState} = data 
       console.log('subscribe:',deviceLinkState)
        if( !(deviceLinkState) ) return;
       const index = DevicesStore.getInstance().devices.findIndex( (device,index,devices)=>{
         return device ? (device._id === deviceLinkState._id) : false;
       } )
      // if(index >= 0 &&DevicesStore.getInstance().devices[index].error!= deviceLinkState.state) DevicesStore.getInstance().devices[index] = {... DevicesStore.getInstance().devices[index], error:deviceLinkState.state}
      if(index >= 0 )DevicesStore.getInstance().devices[index].error= deviceLinkState.state;
      },
      error:(err)=> { console.error(err)
      },
    }) 
  } 

  destructor() {
    this.deviceSubscription.unsubscribe()
  }
  static getInstance() {
    return DevicesStore.instance || ( DevicesStore.instance = new DevicesStore() )
  }
  async initializeDevices() {
    try{
    const result = await this.appStore.apolloClient.query<DevicesQueryResult,{}>({
      query: DevicesQuery,
      fetchPolicy: 'network-only'
    })    

    this.devices = observable.array( result.data.devices, "devices" )
  
  }catch(err){
    this.devices=observable.array([] , "devices")
        console.log(err.message)
      } 
  }

  async addDevice() {
     const result = await this.appStore.apolloClient.mutate<any,{}>({
      mutation: addDevice,
      variables:{ 
        mb_addr:((this.devices.length&&this.devices[this.devices.length-1].mb_addr)?this.devices[this.devices.length-1].mb_addr+1:1)
      },
      //fetchPolicy: 'no-cache'  
    })
    
  
    this.devices.push(result.data.addDevice)

  
  }
  async delDevice(device) {
   try{
    const result = await this.appStore.apolloClient.mutate<any,{}>({
      mutation: gql`mutation delDevice($_id:ID) { delDevice(_id:$_id){status}}`,
      variables:{ _id:device._id },
      fetchPolicy: 'no-cache'  
    })
   
   // arrayRemove.call(this.devices, this.devices.indexOf(device))

      this.devices.remove( device )
      if(this.devices.length==0) this.selected = null

    }catch(e){
      console.error(e)
    }
  }

  async updDevice( value ) {
    const result = await this.appStore.apolloClient.mutate<DevicesQueryResult,{}>({
      mutation: gql`mutation updDevice($deviceInput:DeviceInput!) { updDevice(deviceInput:$deviceInput){status}}`,
      
      variables:{ deviceInput:value },
      fetchPolicy: 'no-cache'  
    })
    
  }

  @action typeOnChenge(device, type:number){
    this.updDevice({_id:device._id, type:type})
    device.type=type
  }
  mbAddrCorrectChange(device){
    
    device.mbAddrCorrect=!device.mbAddrCorrect
    this.updDevice({_id:device._id, mbAddrCorrect:device.mbAddrCorrect?1:0})

  }
  nameOnChange(device:Device, deviceStore:DevicesStore, value){

    device.name = value.replace(/[\/\:]/g,'')
    if(deviceStore)
    deviceStore.updDevice({_id:device._id, name:device.name})
    else this.updDevice({_id:device._id, name:device.name})
 }

 mb_addrOnChange(device:Device, deviceStore:DevicesStore, value){
 // if (!value.search(/\d+/g))  return;
  if(value){
   // console.log(value)
  device.mb_addr = parseInt(value.replace(/[^\d]+/g,'')) ;
  //device.ip_addr = value.match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g)
  }else
  device.mb_addr = 0
 
  deviceStore.updDevice({_id:device._id, mb_addr:device.mb_addr})
}


ip_addrOnChange(device:Device,deviceStore:DevicesStore,value){
  const port:string[] = value.split(':')
  console.log( port )

   let val = value.replace(/:+\d+/g,'').replace(/:/g,'').replace(/[^\d^\.]/g,'').replace(/[^\d\.]+/g,'').replace(/(\d{3})/g,'$1\.').replace(/\.+/g,'.')
     
      if(val.length > 0) 
      {     
        var ip = val.split('.')
        val = '';
        for(let i = 0; i < ip.length && i < 4; ++i){
          if(parseInt(ip[i]) > 255) ip[i] = "255";
          val  += ip[i]
           if(i>2) break;
           if( ip[i].length > 2) val += '.'
           if((ip[i].length < 3 && ip[i+1] != undefined)||!ip[i].length) val += '.' 
          //if(i > 0 && ip[i].length > 2 )ip[i]='.'+ip[i]
        }
       // if(ip.length < 4  ) ip.push('.') 
      }

    //  console.log(ip)
    device.ip_addr =val.replace(/\.+/g,'.')+((port.length>1)?port[port.length-1]?':'+port[port.length-1]:':':'')// ip?(ip[0]+(ip[1]||ip[1].isEmpty?'.'+ip[1]:'')+(ip[2]?ip[2]:'') + (ip[3]?ip[3]:'')):val//value.replace(/[^\d,.]*/g,'').replace(/(\d{3})\d+/g,'$1\.');
    deviceStore.updDevice({_id:device._id, ip_addr:device.ip_addr})
}
 disabled(device:Device){
   let res =  (device == this.selected && this.isEdit)
    return !res
}

@action select = (device:Device) => {

  if(this.selected != device){
   this.selected = device
    if(window.location.pathname.search('views') < 0){
   this.isEdit = true;
    if(this.rulesStore && this.selected)
      this.rulesStore.initializeRules(this.selected)
    
    }

  }

}
 directory={
  address :[],
  numbers :[]
}
getDirectory = async()=>{

  const result = await this.appStore.apolloClient.query<any,{}>({
            query: gql`query getDirectory{getDirectory{numbers address}}`,
            variables:{},
            fetchPolicy: 'network-only'
          }) 
          
  this.directory=result.data.getDirectory
 //console.log(this.directory)



  }

}



