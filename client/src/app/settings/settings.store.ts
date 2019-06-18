import { observable, computed, action } from 'mobx'
import { AppStore } from '../app.store';
import gql from 'graphql-tag';

export class SettingsStore {
  @observable smtpAddress:string = ''
  @observable smtpPort:string=''
  @observable smtpName:string=''
  @observable smtpPassword:string=''
  onSmtpChange = async (name,value)=>{

    this[name]=value
    const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
      mutation: gql`mutation setSmtpConfig($smtpConf:SmtpConfInput!) { setSmtpConfig(smtpConf:$smtpConf){status}}`,
      
      variables:{ smtpConf:{ address:this.smtpAddress, port:parseInt(this.smtpPort), name:this.smtpName, password:this.smtpPassword } },
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
        this.smtpAddress = result.data.getSmtpConfig.address
        this.smtpPort = result.data.getSmtpConfig.port
        this.smtpName = result.data.getSmtpConfig.name
        this.smtpPassword = result.data.getSmtpConfig.password
  }catch(err){
      throw err
  }

  }
  constructor(){this.loadSmtp()}
}
