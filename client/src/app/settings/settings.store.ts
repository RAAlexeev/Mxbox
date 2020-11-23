import { observable } from 'mobx'
import { AppStore } from '../app.store';
import gql from 'graphql-tag';


export class SettingsStore {
  
  @observable settings:{
    pingWatchDogEnable,
    maxCntReboot
  }={pingWatchDogEnable:false, maxCntReboot:0}
  
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
   

  onPortChange = async (num:number,name:string,value:string|number)=>{
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

async onUpload (file){
    console.dir(file)
    let response = await fetch(document.location.origin+'/upload', {
      method: 'POST',
      body: file
    });
    console.dir(response)
    /*const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
      mutation: gql`mutation singleUpload($file: Upload!) {
        singleUpload(file: $file){
          filename
        }
      }
      `, 
      variables:{ file },
      fetchPolicy: 'no-cache'  
    }) 
    AppStore.getInstance().apolloClient.resetStore();
    console.log(result)
   */ //if(result.data.procUpload){
    ///  AppStore.getInstance().appComponent.snackbar.setState({active:true,label:`${result.data.procUpload.filename} успешно загружен... презагрузка...`})
    //  return true
   // }
  //  else{
    //  AppStore.getInstance().appComponent.snackbar.setState({active:true,label:`${result}`})
    //  return false
//    }
 } 
 async loadSettings(){
  const result = await AppStore.getInstance().apolloClient.query<any,{}>({
         query: gql`query getSettings{ getSettings{pingWatchDogEnable maxCntReboot} }`,
     variables:{},
     fetchPolicy: 'no-cache'
     }) 
     console.log( result.data.getSettings )
     if( result.data.getSettings )this.settings = result.data.getSettings
     
 }
  async loadSmtp(){
   const result = await AppStore.getInstance().apolloClient.query<any,{}>({
          query: gql`query getSmtpConfig{getSmtpConfig{address port name password}}`,
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
          try{
          const result = await AppStore.getInstance().apolloClient.query<any,{}>({
                 query: gql`query getWiFiConfig{getWiFiConfig{SSID PSK TYPE}}`,
                 variables:{},
                 fetchPolicy: 'no-cache'
             }) 
             if(result.data.getWiFiConfig)
             this.WiFi = result.data.getWiFiConfig
             else throw new Error('Пустое значение getWiFiConfig')
            }catch(err){
              //alert(err.message)
              throw err
            }
          }
          async setRebootCnt(cnt:string){
            const s = this.settings.maxCntReboot
            if(cnt)this.settings.maxCntReboot = parseInt(cnt)
            
            try{
              const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
              mutation: gql`mutation setSettings($settings:SettingsInput!) { setSettings(settings:$settings){status}}`,
              variables:{ settings:  {     
                            pingWatchDogEnable:this.settings.pingWatchDogEnable,
                            maxCntReboot:parseInt(this.settings.maxCntReboot )
                        }
              },
              fetchPolicy: 'no-cache'  
            })
            }catch(err){
              if(cnt===undefined){ this.settings.pingWatchDogEnable = ! this.settings.pingWatchDogEnable}
              else this.settings.maxCntReboot = s
              throw  err
            }
          }
       switchPingWatch(){
         this.settings.pingWatchDogEnable = !this.settings.pingWatchDogEnable
         this.setRebootCnt(undefined)
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
    wiFiChangeTimeout 
    
    async onWiFiChange(name:string,value:string){
     
      let save=this.WiFi[name]
      this.WiFi[name]=value
      
      clearTimeout(this.wiFiChangeTimeout)
      
      this.wiFiChangeTimeout = setTimeout(async ()=>{
      try{
        await AppStore.getInstance().apolloClient.mutate<any,{}>({
          mutation: gql`mutation setWiFiConfig( $WiFiConf:WiFiConfInput! ) { setWiFiConfig(WiFiConf:$WiFiConf){status} }`, 
          variables:{ WiFiConf: { SSID:this.WiFi.SSID,PSK:this.WiFi.PSK } },
          fetchPolicy: 'no-cache'  
        })
      }catch(err){
        this.WiFi[name]=save
        throw  err
      }
    },5000)
    }
  //  @observable testEmailStatus=''
    async testEmail({email}){
      try{
         await AppStore.getInstance().apolloClient.mutate<any,{}>({
          mutation: gql`mutation tested( $email:EmailInput ){ tested(email:$email){ status } }`, 
          variables:{ email: email },
          fetchPolicy: 'no-cache'  
        })
        //alert(result.data.tested.status)
      }catch(err){
      // alert(err.message)
        throw  err
      }
    }
  constructor(){  
    // this.smtpSettings={
    //    address:undefined,     port:undefined,  name:undefined,  password:undefined
    // }
   // this.portsSettings = [{num:0, speed:19200,param:'8e1'}, {num:1, speed:19200, param:'8e1', protocol:0, addr:200}]
    this.loadSettings()
    this.loadPorts()
    this.loadSmtp()
    this.loadAPN()
    this.loadWiFi()

  }
}
