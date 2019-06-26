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
  
  onSmtpChange = async (name, value)=>{
    this.smtpSettings[name]=value
    const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
      mutation: gql`mutation setSmtpConfig($smtpConf:SmtpConfInput!) { setSmtpConfig(smtpConf:$smtpConf){status}}`, 
      variables:{ smtpConf:this.smtpSettings },
      fetchPolicy: 'no-cache'  
    }) 
  }

onPort1Change =async (num,name,value)=>{
  this.portsSettings[num][name]=value
  const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
    mutation: gql`mutation setPortConfig($portConf:portConfInput!) { setPortConfig(portConf:$portConf){status}}`, 
    variables:{ portConf:this.portsSettings[0] },
    fetchPolicy: 'no-cache'  
  })
}
 loadSmtp =async()=>{
  try{ const result = await AppStore.getInstance().apolloClient.query<any,{}>({
          query: gql`query getSmtpConfig{getSmtpConfig{address, port, name }}`,
      variables:{},
      fetchPolicy: 'network-only'
      }) 
      console.log( result.data )
        this.smtpSettings = result.data.getSmtpConfig//?result.data.getSmtpConfig:this.smtpSettings
       // this.smtpSettings.smtpPort = result.data.ge//tSmtpConfig.port
      //  this.smtpSettings.smtpName = result.data.getSmtpConfig.name
      //  this.smtpSettings.smtpPassword = result.data.getSmtpConfig.password
  }catch(err){

      throw err
  }

  }
  
  constructor(){  
    this.smtpSettings={
       address:undefined,     port:undefined,  name:undefined,  password:undefined
    }
    this.portsSettings = [{num:0, speed:0,param:''},{num:1, speed:0, param:''}]
  this.loadSmtp()}
}
