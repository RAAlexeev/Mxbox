import { observable } from 'mobx'
import { AppStore } from '../app.store';
import gql from 'graphql-tag';

export class SettingsStore {
  

  
  @observable  smtpSettings: {
    address:string;
    port:number;
    name:string;
    password:string;
  }={address:'smtp.yandex.ru',port:465,name:'',password:'password'}

  @observable portsSettings:{
    num:number;
    speed:number;
    param:string;
    protocol?:number;
    addr?:number;
  }[]=[{num:0, speed:19200,param:'8e1'}, {num:1, speed:19200, param:'8e1', protocol:0, addr:200}]

  @observable  APN:{
    apn:string,
    mcc:string,
    mnc:string,
    user:string,
    password:string
  }={  apn:'', mcc:'',  mnc:'',    user:'',    password:'' }
  @observable  WiFi:{
    SSID:string,
    PSK:string,
    TYPE:string
  }={SSID:"",PSK:"",TYPE:""}
  onSmtpChange = async (name:string, value:string|number)=>{
    const save = this.smtpSettings[name]
    this.smtpSettings[name]=value
    try{
      const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
        mutation: gql`mutation setSmtpConfig($smtpConf:SmtpConfInput!) { setSmtpConfig(smtpConf:$smtpConf){status}}`, 
        variables:{ smtpConf:{[name]:value} },
        fetchPolicy: 'no-cache'  
      })
    }catch(err){
      this.smtpSettings[name]=save
    } 
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
    //console.log(result)
    if(result.data.procUpload.filename){
      AppStore.getInstance().appComponent.snackbar.setState({active:true,label:`${result.data.procUpload.filename} успешно загружен...`})
    }
  } 
  async loadSmtp(){
   const result = await AppStore.getInstance().apolloClient.query<any,{}>({
          query: gql`query getSmtpConfig{getSmtpConfig{address port name }}`,
      variables:{},
      fetchPolicy: 'no-cache'
      }) 
      console.log( result.data )
      if( result.data.getSmtpConfig &&  result.data.getSmtpConfig.address )
        this.smtpSettings = result.data.getSmtpConfig
  }


  async loadPorts(){
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
    async loadAPN(){
      const result = await AppStore.getInstance().apolloClient.query<any,{}>({
             query: gql`query getAPNConfig{getAPNConfig{apn mcc mnc user}}`,
         variables:{},
         fetchPolicy: 'no-cache'
         }) 
         console.log(result.data.getAPNConfig)
         if(result.data.getAPNConfig)
         this.APN = result.data.getAPNConfig
         else throw new Error('Пустое значение АПН')
        }

        async loadWiFi(){
          const result = await AppStore.getInstance().apolloClient.query<any,{}>({
                 query: gql`query getWiFiConfig{getWiFiConfig{SSID PSK TYPE}}`,
             variables:{},
             fetchPolicy: 'no-cache'
             }) 
             //console.log(result.data.getWiFiConfig)
             if(result.data.getWiFiConfig)
             this.WiFi = result.data.getWiFiConfig
             else throw new Error('Пустое значение getWiFiConfig')
            }

    async onAPNChange(name:string, value:string){
      let save=value
      this.APN[name]=value
      try{
            const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
        mutation: gql`mutation setAPNconfig($APNconf:APNconfInput!) { setAPNconfig(APNconf:$APNconf){status}}`, 
          variables:{ APNconf: {[name]:value} },
          fetchPolicy: 'no-cache'  
        })
      }catch(err){
        this.APN[name]=save
        throw  err
      }
       
  
    }
    async onWiFiChange(name:string,value:string){
      let save=value
      this.WiFi[name]=value
      try{
            const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
        mutation: gql`mutation setWiFiConfig($WiFiConf:WiFiConfInput!) { setWiFiConfig(WiFiConf:$WiFiConf){status}}`, 
          variables:{ WiFiConf: {[name]:value} },
          fetchPolicy: 'no-cache'  
        })
      }catch(err){
        this.WiFi[name]=save
        throw  err
      }
    }
  constructor(){  
    // this.smtpSettings={
    //    address:undefined,     port:undefined,  name:undefined,  password:undefined
    // }
   // this.portsSettings = [{num:0, speed:19200,param:'8e1'}, {num:1, speed:19200, param:'8e1', protocol:0, addr:200}]
    this.loadPorts()
    this.loadSmtp()
    this.loadAPN()
    this.loadWiFi()
  }
}
