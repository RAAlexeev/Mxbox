//import { observable, computed, action } from 'mobx'

import { AppStore } from '../app.store'
import gql from 'graphql-tag'
import { observable } from 'mobx'
import { isUndefined } from 'util'

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
  @observable signalQuality:0
  async loadInfo(){
    const result = await AppStore.getInstance().apolloClient.query<any,{}>({
           query: gql`query getInfo{getInfo{ifaces{ ap0{address netmask family mac internal } ccmni0{address netmask family mac internal } ccmni1{address netmask family mac internal } ccmni2{address netmask family mac internal }
                                                  } io firmware uptime hostname freemem                                          
                                   }       }`,
       variables:{},
       fetchPolicy: 'no-cache'
       }) 
       console.log(result.data.getInfo)
       if(result.data.getInfo)
       this.info = {... result.data.getInfo}
       else throw new Error('Пустое значение Info')
      }
      subscription
      constructor(){
 
          this.subscription =  AppStore.getInstance().apolloClient.subscribe({
            query: gql`subscription signalGSM{
              signalGSM
            }`,
            variables: { }
          }).subscribe({
            next:({data})=> {
    
             //console.log('subscribe:',errorMessages)
              if( !isUndefined(data) ) return;
              this.signalQuality=data
            },
            error:(err)=> { 
              console.error(err)
            },
          }) 
         

          //console.log(document.domain)
      
      
        
        this.loadInfo()
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
