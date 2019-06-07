import { observable, action } from 'mobx'
import gql from 'graphql-tag'
import { AppStore } from '../app.store'
import { arrayRemove } from '../utils';
import {Device, DevicesStore} from '../devices/devices.store';
import { Trig } from './trigs/trigs.store';
import{Act} from './acts/acts.store'



export interface Sms{
  number:string[]
  text:string
}
export interface Email{
  address:string
  subject:string
  body?:string
}

export interface Rule {
  trigs?:Array<Trig>
  acts?:Array<Act>
}

interface TemplatesQueryResult {
  templates?: Array<Device> 
}

export class TemplatesStore {
  appStore: AppStore
 


  @observable templates: Array<Device> = []
  
  constructor() {
    let self = this
    this.appStore = AppStore.getInstance()
    this.initializeTemlates()
  } 
  static instance:TemplatesStore 
  static getInstance() {
    return TemplatesStore.instance || (TemplatesStore.instance = new TemplatesStore())
  }

  destructor() {
   
  }

  async initializeTemlates() {
       const result = await this.appStore.apolloClient.query<TemplatesQueryResult,{}>({
     
      query:gql`
      query TemplatesQuery { templates{ _id, name } }`,
     
      fetchPolicy: 'network-only'
    }) 
   // console.log(result.data.rules)
    this.templates = result.data.templates
  }
  async addAsTemplate( device ) {
    const result = await this.appStore.apolloClient.mutate<TemplatesQueryResult,{}>({
     mutation: gql`mutation AddAsTemplate($device:ID!){addAsTemplate(_id:$device){status}}`,
     variables:{ 
        device:device._id
     },
     //fetchPolicy: 'no-cache'  
   })
   

   this.initializeTemlates()
  }
  async delTemplate( device ) {
    const result = await this.appStore.apolloClient.mutate<TemplatesQueryResult,{}>({
     mutation: gql`mutation delTemplate($device:ID!){delTemplate(_id:$device){status}}`,
     variables:{ 
        device:device._id
     },
     //fetchPolicy: 'no-cache'  
   })
   this.initializeTemlates()
  }
}
