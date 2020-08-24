import { observable, action } from 'mobx'
import gql from 'graphql-tag'
import { AppStore } from '../../app.store'
import { arrayRemove } from '../../utils';
import { Device, DevicesStore } from '../../devices/devices.store';
import { Rule } from '../rules.store';



  

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
export interface Trig{
  __typename: any;
  type:Number
  condition?:String
  sms?:Sms
  email?:Email
  cron?:String
  coment?:String
}
interface Sms{
  number:String[]
  text:String
}
interface Email{
  addr:String
  subj:String
  body?:String
}


interface RulesQueryResult {
  trigs?: Array<Trig>
  rule?:Rule
}

export class TrigsStore {
  appStore:AppStore = AppStore.getInstance()
  devicesStore:DevicesStore = DevicesStore.getInstance()
 // deviceSubscription
  dialogs
  ruleNum:Number
  rule:Rule
  @observable trigs: Array<Trig> = []

  constructor(rule:Rule, ruleNum:number, dialogs) {
    let self = this
    this.ruleNum = ruleNum
    this.trigs = rule.trigs?rule.trigs:[]
    this.rule = rule
    this.dialogs = dialogs
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

 
  
  @action  addTrig = async (trig:Trig)=>{
    try{
    const result = await this.appStore.apolloClient.mutate<RulesQueryResult,{}>({
      mutation: gql`mutation addTrig($device:ID!,$ruleNum:Int!,$trigInput:TrigInput!){addTrig(device:$device,ruleNum:$ruleNum,trigInput:$trigInput){status}}`,
      variables:{
        device:this.devicesStore.selected._id,
        ruleNum:this.ruleNum,
        trigInput:trig
      },
      fetchPolicy: 'no-cache'  
    }) 
    this.rule.trigs.push(trig)
    }catch(err){
      console.error(err.toString())
    }
  }
  @action updTrig = async (trig:Trig)=>{
   let index = this.trigs.findIndex((val,index)=>(val===trig))
   if(index >= 0)
   try{
    
      const result = await this.appStore.apolloClient.mutate<RulesQueryResult,{}>({
      mutation: gql`mutation updTrig($device:ID!,$ruleNum:Int!,$trigNum:Int!,$trigInput:TrigInput!){updTrig(device:$device,ruleNum:$ruleNum,trigNum:$trigNum,trigInput:$trigInput){status}}`,
      variables:{
        device:this.devicesStore.selected._id,
        ruleNum:this.ruleNum,
        trigNum:index,
        trigInput:{type:trig.type,condition:trig.condition,cron:trig.cron,sms:trig.sms,coment:trig.coment}
      },
      fetchPolicy: 'no-cache'  
    })
    this.trigs[index] = null
    this.trigs[index] = trig
    }catch(err){
      console.error(err)
      return false
    }finally{

    }
  }
  @action  delTrig = async (trigNum:number)=>{
    try{
    const result = await this.appStore.apolloClient.mutate<RulesQueryResult,{}>({
      mutation: gql`mutation delTrig($device:ID!,$ruleNum:Int!,$trigNum:Int!){delTrig(device:$device,ruleNum:$ruleNum,trigNum:$trigNum){status}}`,
      variables:{
        device:this.devicesStore.selected._id,
        ruleNum:this.ruleNum,
        trigNum:trigNum
      },
      fetchPolicy: 'no-cache'  
    }) 
    this.rule.trigs[trigNum] = null
    }catch(err){
      console.error(err.toString())
    }
  }    

/*   async delRule(rule) {
    const result = await this.appStore.apolloClient.mutate<RulesQueryResult,{}>({
      mutation: gql`mutation delDevice($_id:ID) { delDevice(_id:$){status}}`,
      variables:{ _id:rule._id },
      fetchPolicy: 'no-cache'  
    })
    
    arrayRemove.call(this.rules, this.rules.indexOf(rule))
  }

  async updDevice(value) {
    const result = await this.appStore.apolloClient.mutate<RulesQueryResult,{}>({
      mutation: gql`mutation updDevice($deviceInput:DeviceInput!) { updDevice(deviceInput:$deviceInput){status}}`,
      
      variables:{ deviceInput:value },
      fetchPolicy: 'no-cache'  
    })
    
  } */



}
