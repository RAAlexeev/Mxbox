import { observable, action } from 'mobx'
import gql from 'graphql-tag'
import { AppStore } from '../app.store'
import {Device, DevicesStore} from '../devices/devices.store';
import { Trig } from './trigs/trigs.store';
import{Act} from './acts/acts.store'

const DevicesQuery = gql`
  query DevicesQuery {
    devices
    {
      _id,
      name,
      mb_addr,
      ip_addr
    }
  }
`
const addDevice = gql`
mutation addDevice{
  addDevice(device:{name:"новый"}){
    _id,
    name
  }
  
  
}
`
const DevicesSubscription = gql`
subscription DeviceSubscription($name: String!){
  Post(filter: {
    mutation_in: [CREATED],
    node: {
      name: $name
    }
  }) {
    node {
      id,
      name,
      title,
      message
    }
  }
}
`

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

interface RulesQueryResult {
  rules?: Array<Rule>
  rule?:Rule
}

export class RulesStore {
  appStore: AppStore
  devicesStore:DevicesStore
 // deviceSubscription

  @observable rules: Array<Rule> = []
  
  constructor() {
    let self = this
    this.appStore = AppStore.getInstance()
    this.devicesStore = DevicesStore.getInstance()
/*      this.deviceSubscription = this.appStore.apolloClient.subscribe({
      query: DevicesSubscription,
      // This way realtime updates will work only when both posting and reading users have the same name. Proof of concept.
      variables: { name: this.appStore.username }
    }).subscribe({
      next(data) {
        self.devices.unshift(data.Post.node)
      },
      error(err) { console.error('err', err) },
    }) */
  } 

  destructor() {
    //this.deviceSubscription.unsubscribe()
  }

  async initializeRules(device:Device) {
      try{ const result = await this.appStore.apolloClient.query<RulesQueryResult,{}>({
            query: gql`query rules($device:ID!){rules(device:$device){acts{type sms{numbers text}
                                                                email{address subject body}
                                                                DO} 
                                                                trigs{type condition coment inEmail{subject body}
                                                                inSms{numbers text} 
                                                                cron}}}`,
      variables:{device:device._id},
      fetchPolicy: 'network-only'
    }) 
   // console.log(result.data.rules)
    this.rules = result.data.rules
  }catch(err){
    throw err
   //const snackbar:Snackbar = (this.appStore.appComponent.refs.app as App).refs.snackbar as Snackbar
  // snackbar.setState({...snackbar.state, active:true})
  }

  }
  @action async addRule(device:Device) {
      const result = await this.appStore.apolloClient.mutate<RulesQueryResult,{}>({
      mutation: gql`mutation addRule($device:ID!){addRule(device:$device){status}}`,
      variables:{device:device._id},
      fetchPolicy: 'no-cache'  
    }) 
    this.rules.push({trigs:[],acts:[]})
  }
  @action async delRule(rule, ruleNum) {
    const result = await this.appStore.apolloClient.mutate<RulesQueryResult,{}>({
      mutation: gql`mutation delRule($device:ID!,$ruleNum:Int!){ delRule(device:$device,ruleNum:$ruleNum){status} }`,
      variables:{ device:rule._id,
                  ruleNum:ruleNum },
      fetchPolicy: 'no-cache'  
    })
    
   // arrayRemove.call(this.rules, this.rules.indexOf(rule))
   this.rules[ruleNum]=null
  }


  @action async addFromTemplate(device:Device,template:Device) {
    const result = await this.appStore.apolloClient.mutate<RulesQueryResult,{}>({
     mutation: gql`mutation addFromTemplate($device:ID!,$template:ID!){addFromTemplate(device:$device,template:$template){
                                                                    acts{
                                                                          type 
                                                                          sms{numbers text} 
                                                                          email{address subject body}
                                                                    } 
                                                                    trigs{
                                                                        type 
                                                                        condition 
                                                                        inEmail{subject body}  
                                                                        inSms{numbers text} cron}
                                                                    }
                                                                  }`,
     variables:{ 
        device:device._id,
        template:template._id
     },
     //fetchPolicy: 'no-cache'  
   })
  // console.log(result)
   const indexFist = result.data.addFromTemplate.findIndex( item=>item?true:false )
    result.data.addFromTemplate.forEach( ( item, index )=>{ if( index >= indexFist )this.rules.push( item )} )
  // this.rules.push(result.data.addFromTemplate)

  }


}
