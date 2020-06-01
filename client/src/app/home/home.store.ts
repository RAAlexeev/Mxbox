//import { observable, computed, action } from 'mobx'

import { AppStore } from '../app.store'
import gql from 'graphql-tag'
import { observable, action } from 'mobx'


type IfaceInfo={
  address: String
  netmask: String
  family: String
  mac: String
  internal: Boolean
  cidr: String
}
type Ifaces={
  ap0:[IfaceInfo]
  ccmni0:[IfaceInfo]
  ccmni1:[IfaceInfo]      
  ccmni2:[IfaceInfo]      
}
type Info={
  ifaces:Ifaces
  
  uptime:Number
  hostname:String
  freemem:String
}
export class HomeStore {

  @observable info ={ifaces:undefined,io:[], firmware:'',uptime:0,hostname:'',freemem:0}
  @observable signalQuality=0
  @observable pingResult = ""
  @observable ip_addr = ""
  @observable ioTest = false
  async loadInfo(){
    const result = await AppStore.getInstance().apolloClient.query<any,{}>({
           query: gql`query getInfo{getInfo{ifaces{ 
                                                ap0{address netmask family mac internal } 
                                                ccmni0{address netmask family mac internal } 
                                                ccmni1{address netmask family mac internal }
                                                ccmni2{address netmask family mac internal }
                                                  } 
                                                   io firmware uptime hostname freemem                                          
                                   }}`,
       variables:{},
       fetchPolicy: 'no-cache'
       }) 
      // console.log(result.data.getInfo)
       if(result.data.getInfo)
       this.info = result.data.getInfo
       else throw new Error('Пустое значение Info')
      }
      subscription
      constructor(){
 
          this.subscription =  AppStore.getInstance().apolloClient.subscribe({
            query: gql`subscription signalGSM{signalGSM}`,
            variables: { }
          }).subscribe({
            next:({data})=> {
              const {signalGSM} = data
             console.log('signalGSM:',data)
            
              this.signalQuality=signalGSM
            },
            error:(err)=> { 
              console.error(err)
            },
          }) 
         

          //console.log(document.domain)
      
      
        
        this.loadInfo()
      }
      set_ip_addr(ip_addr){
        this.ip_addr = ip_addr
      } 
    async ping(){
      this.pingResult=""
      try{
        const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
          mutation: gql`mutation ping($ip_addr:String){ ping(ip_addr:$ip_addr) }`, 
          variables:{ ip_addr: this.ip_addr?this.ip_addr:"ya.ru" },
          fetchPolicy: 'no-cache'  
        })
        this.pingResult = result.data.ping 
      }catch(err){
       // this.APN[name]=save
        throw  err
      }
    } 
   @action  async switch_ioTest(){
      this.ioTest!=this.ioTest
      try{
        const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
          mutation: gql`mutation switch_io_test{switch_io_test}`, 
          variables:{},
          fetchPolicy: 'no-cache'  
        })
        this.ioTest=result.data.switch_io_test
      }catch(err){
        this.ioTest=!this.ioTest
        throw  err
      } 
    }
    async testSMS(sms){
      try{
        const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
          mutation: gql`mutation tested($sms:InputSMS){ tested(sms:$sms) }`, 
          variables:{ sms: sms },
          fetchPolicy: 'no-cache'  
        })
<<<<<<< HEAD
        alert("Отправлено...")
      }catch(err){
        alert(err.message)
=======
        this.pingResult = result.data.ping 
      }catch(err){
       // this.APN[name]=save
>>>>>>> 2b7387927a473b7ee40d1259f1253e1a3a6f534c
        throw  err
      }
    }
      destructor(){
        if(this.subscription)this.subscription.unsubscribe()
      }

/*   @observable counter = 0
  increment = () => {
    this.counter++
  }
  @computed get counterMessage() {
    console.log('recompute counterMessage!')
    return `${this.counter} ${this.counter === 1 ? 'click' : 'clicks'} since last visit`
  } */
}
