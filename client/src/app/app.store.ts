import { observable, action } from 'mobx'
import { ApolloLink, HttpLink, InMemoryCache, gql } from "apollo-boost"
import {WebSocketLink} from 'apollo-link-ws'
import { SubscriptionClient    } from 'subscriptions-transport-ws'
import ApolloClient from 'apollo-client'
//import * as apolloLinkError from 'apollo-link-error'

const wsClient = new SubscriptionClient(`ws://${document.location.host/* .replace(/:3000/,':3001') */}/graphql`, {
  reconnect: true,
  connectionParams: {
    // Pass any arguments you want for initialization
  } 
})


import { getOperationAST } from 'graphql';  
import { App } from './app.component';
import { createUploadLink } from 'apollo-upload-client'

const customFetch = async (uri, options) => {
   const response = await fetch(uri, options)
    if (response.status >= 400) {  // or handle 400 errors
      return Promise.reject(response.status);
    }
    return response;
  };

const link = ApolloLink.split(
  operation => {
  	const operationAST = getOperationAST(operation.query, operation.operationName);
  	return !!operationAST && operationAST.operation === 'subscription';
  },
  new WebSocketLink(wsClient),
/*   new HttpLink({
    uri: `${document.location.origin.replace(/:3000/,':3001')}/graphql`,
    fetch: customFetch,
  }),  */ 
  createUploadLink({
    uri:document.location.origin/* .replace(/:3000/,':3001') */+'/graphql',
    fetch: customFetch,
  })
 )

import { onError } from "apollo-link-error";
import Snackbar from 'react-toolbox/lib/snackbar';
export class AppStore {
  
  numberExchengDialog: import("../../../../mxBox/client/src/app/dialogs/numberExchange.dialog").NumberExchengDialog
  static instance: AppStore
  appComponent:App
  //@observable username = 'Mr. User'
  snackbar: Snackbar 
  apolloClient = new ApolloClient({
                      link: ApolloLink.from([ onError(({ graphQLErrors, networkError }) => {
                   
                                                        if (graphQLErrors)
                                                          graphQLErrors.map(({ message, locations, path }) =>{

                                                          if(this.appComponent)this.appComponent.snackbar.setState({active:true,label://console.log(
                                                                        `[ошибка GraphQL]: Message: ${message}, Location: ${locations}, Path: ${path}`
                                                                    })
                                                                  })
                                                      if (networkError)// console.log(
                                                        if(this.appComponent)this.appComponent.snackbar.setState({active:true,label:`[Ошибка сети]: ${networkError}`})
                                                        })
                                              , link]),
                      cache: new InMemoryCache()
              
                      })

  errorSubscription = {}

  constructor(){
    this.errorSubscription = this.apolloClient.subscribe({
      query: gql`subscription errorMessages{
        errorMessages{
          message
        }
      }`,
      variables: { }
    }).subscribe({
      next:({data})=> {
       const {errorMessages} = data 
       console.log('subscription:',errorMessages)
        if( !(errorMessages) ) return;
        if(this.appComponent)this.appComponent.snackbar.setState({active:true, label:errorMessages.message})
       
      },
      error:(err)=> { console.error(err)
      },
    }) 
   
    wsClient.onError((err)=>{
      //console.dir(t)
      if(this.appComponent)this.appComponent.snackbar.setState({active:true, label:`[Ошибка сети(ws)]: Соеденение разорвано`})

    })
    //console.log(document.domain)


  }
  static getInstance() {
    return AppStore.instance || (AppStore.instance = new AppStore())
  }
  onLoad = async(file)=>{ 
    const result = await AppStore.getInstance().apolloClient.mutate<any,{}>({
      mutation: gql`mutation settingsUpload($file: Upload!) {
        settingsUpload(file: $file){
          filename
        }
      }`, 
      variables:{ file:file },
      fetchPolicy: 'no-cache'  
    }) 
    return result
    
  }
  
  async onNumberExchenge(sNumber:string,dNumber:string){
    console.log(sNumber,dNumber)
    const result = await await AppStore.getInstance().apolloClient.mutate<any,{}>({
      mutation: gql`mutation exchangeNum($sNum:String!,$dNum:String!){exchangeNum(sNum:$sNum,dNum:$dNum){status}}`, 
      variables:{ sNum:sNumber,
                  dNum:dNumber
                },
      fetchPolicy: 'no-cache'  
    }) 
    
    AppStore.getInstance().appComponent.snackbar.setState({active:true, label:`${result.data.exchangeNum.status}`})
  }

 // @action onUsernameChange = (val) => {
 //   this.username = val
 // }

}
