import { observable, action, runInAction, computed } from 'mobx'
import gql from 'graphql-tag'
import { AppStore } from '../app.store'
import { arrayRemove } from '../utils';
import { Rule, RulesStore } from '../rules/rules.store';
import { Devices } from '../devices/devices.component';
import { DevicesStore } from '../devices/devices.store';




export interface Device {
  _id: string
  name: string
  mb_addr?: number
  ip_addr?: string
  rules?: Array<Rule> 
  error?:string
}

interface DevicesQueryResult {
  devices?: Array<Device>
  device?:Device
}

export class DevViewStore {
  static instance: DevViewStore
  appStore: AppStore

 // deviceSubscription

  deviceSubscription: ZenObservable.Subscription;
  constructor(){
      let self = this
      this.appStore = AppStore.getInstance()


        this.deviceSubscription = this.appStore.apolloClient.subscribe({
        query: gql`subscription onDNK4upd{
                updDNK4ViewData(id:ID){
                  _id,
                  pumps,
                  levels,
                }
              }`,
        variables: {id:DevicesStore.getInstance().selected._id }
      }).subscribe({
        next:(data)=> {

      ///   console.log(this.data)
          if(!data.data) return;
        //const index = DevicesStore.getInstance().devices.findIndex( (device,index,devices)=>{
        //  return device && data.data.deviceLinkState ? device._id === data.data.deviceLinkState._id : false;
       // } )
       // if(index >= 0) DevicesStore.getInstance().devices[index].error=data.data.deviceLinkState.state
        },
        error:(err)=> { console.error(err)
        },
      }) 
  } 

  destructor() {
    this.deviceSubscription.unsubscribe()
  }
  static getInstance() {
    return DevViewStore.instance || (DevViewStore.instance = new DevViewStore() )
  }


  

}



