import { observable } from 'mobx'
import { AppStore } from '../app.store';
import gql from 'graphql-tag';

export class SettingsStore {
  @observable APN: {
    APN:string;
    type:string;
  }={APN:'',type:'default'};
  @observable  smtpSettings: {
    address:string;
    port:number;
    name:string;
    password:string;
  }={address:'smtp.yandex.ru',port:465,name:'',password:''}
  @observable portsSettings:{
    num:number;
    speed:number;
    param:string;
    protocol?:number;
    addr?:number;
  }[]=[{num:0, speed:19200,param:'8e1'}, {num:1, speed:19200, param:'8e1', protocol:0, addr:200}]
  
  onSmtpChange = async (name:string, value:string|number)=>{
    const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
      mutation: gql`mutation setSmtpConfig($smtpConf:SmtpConfInput!) { setSmtpConfig(smtpConf:$smtpConf){status}}`, 
      variables:{ smtpConf:{[name]:value} },
      fetchPolicy: 'no-cache'  
    }) 
    this.smtpSettings[name]=value
  
  }

  onPortChange =async (num:number,name:string,value:string|number)=>{
        const save =  this.portsSettings[num][name]
        this.portsSettings[num][name]= value
        let portConf
         portConf = {speed:this.portsSettings[num].speed, param:this.portsSettings[num].param, num:num}
        if(this.portsSettings[num].protocol>=0) portConf.protocol = this.portsSettings[num].protocol// = {...portConf,protocol: this.portsSettings[num].protocol}
        if(this.portsSettings[num].addr) portConf.addr = this.portsSettings[num].addr
        try{
        const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
        mutation: gql`mutation setPortConfig($portConf:PortConfInput!) { setPortConfig(portConf:$portConf){status}}`, 
          variables:{ portConf:portConf },
          fetchPolicy: 'no-cache'  
        })
      }catch(err){
        this.portsSettings[num][name]=save
        throw err
      }
  }
  onPort1Change = (name:string,value:string|number)=>{
    this.onPortChange(0,name,value)
  }
  onPort2Change = (name:string,value:string|number)=>{
    if(name==='addr')value = parseInt(value as string)
    this.onPortChange(1,name,value)
  }

async onUpload (value){
    console.dir(value)
    const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
      mutation: gql`mutation procUpload($file: Upload!) {
        procUpload(file: $file){
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
          query: gql`query getSmtpConfig{getSmtpConfig{address port name }}`,
      variables:{},
      fetchPolicy: 'no-cache'
      }) 
      console.log( result.data )
      if( result.data.getSmtpConfig &&  result.data.getSmtpConfig.address )
        this.smtpSettings = result.data.getSmtpConfig
  }


  loadPorts =async()=>{
     const result = await AppStore.getInstance().apolloClient.query<any,{}>({
            query: gql`query getPortsConfig{getPortsConfig{num speed param protocol addr}}`,
        variables:{},
        fetchPolicy: 'no-cache'
        }) 
        //console.log( result.data )
        if( !result.data.getPortsConfig[0] ) result.data.getPortsConfig[0]={num:0, speed:19200,param:'8e1'}
        if( !result.data.getPortsConfig[1] ) result.data.getPortsConfig[1]={num:1, speed:19200,param:'8e1', protocol:1, addr:200}
        this.portsSettings = result.data.getPortsConfig

  
    }
    onAPNChange(name:string,value:string){
      
    }
  constructor(){  
    // this.smtpSettings={
    //    address:undefined,     port:undefined,  name:undefined,  password:undefined
    // }
   // this.portsSettings = [{num:0, speed:19200,param:'8e1'}, {num:1, speed:19200, param:'8e1', protocol:0, addr:200}]
    this.loadPorts()
    this.loadSmtp()

  }
}
