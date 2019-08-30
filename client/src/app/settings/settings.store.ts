import { observable, computed, action } from 'mobx'
import { AppStore } from '../app.store';
import gql from 'graphql-tag';

export class SettingsStore {
  @observable  smtpSettings: {
    address:string;
    port:number;
    name:string;
    password:string;
  }
  @observable portsSettings:{
    num:number;
    speed:number;
    param:string;
  }[]
  
  onSmtpChange = async (name:string, value:string|number)=>{
    const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
      mutation: gql`mutation setSmtpConfig($smtpConf:SmtpConfInput!) { setSmtpConfig(smtpConf:$smtpConf){status}}`, 
      variables:{ smtpConf:{[name]:value} },
      fetchPolicy: 'no-cache'  
    }) 
    this.smtpSettings[name]=value
  
  }

  onPort1Change =async (name:string,value:string|number)=>{
    const save = this.portsSettings[0][name]
    this.portsSettings[0][name]=value
    try{
    const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
    mutation: gql`mutation setPortConfig($portConf:PortConfInput!) { setPortConfig(portConf:$portConf){status}}`, 
    variables:{ portConf:{num:0, speed:this.portsSettings[0].speed,param:this.portsSettings[0].param} },
    fetchPolicy: 'no-cache'  
  })
}catch(err){
  this.portsSettings[0][name]=save
  throw(err)
}
}
async onUpload (value){
    console.dir(value)
    const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
      mutation: gql`mutation singleUpload($file: Upload!) {
        singleUpload(file: $file){
          filename
        }
      }`, 
      variables:{ file:value },
      fetchPolicy: 'no-cache'  
    }) 
    return result
  } 
 loadSmtp =async()=>{
   const result = await AppStore.getInstance().apolloClient.query<any,{}>({
          query: gql`query getSmtpConfig{getSmtpConfig{address, port, name }}`,
      variables:{},
      fetchPolicy: 'no-cache'
      }) 
      console.log( result.data )
      if( result.data.getSmtpConfig &&  result.data.getSmtpConfig.address )
        this.smtpSettings = result.data.getSmtpConfig
  }


  loadPorts =async()=>{
     const result = await AppStore.getInstance().apolloClient.query<any,{}>({
            query: gql`query getPortsConfig{getPortsConfig{num, speed, param }}`,
        variables:{},
        fetchPolicy: 'no-cache'
        }) 
        console.log( result.data )
        if( result.data.getPortsConfig[0] )
          this.portsSettings = result.data.getPortsConfig

  
    }
  constructor(){  
    this.smtpSettings={
       address:undefined,     port:undefined,  name:undefined,  password:undefined
    }
    this.portsSettings = [{num:0, speed:19200,param:'8e1'}]
    this.loadPorts()
    this.loadSmtp()

  }
}
