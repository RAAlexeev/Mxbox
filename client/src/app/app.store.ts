import { observable, action } from 'mobx'
import { ApolloLink, HttpLink, InMemoryCache } from "apollo-boost"
import {WebSocketLink} from 'apollo-link-ws'
import { SubscriptionClient    } from 'subscriptions-transport-ws'
import ApolloClient from 'apollo-client'
//import * as apolloLinkError from 'apollo-link-error'

const wsClient = new SubscriptionClient(`ws://${document.URL.replace(/(^\w+:|^)\/\//, '')}/graphql`, {
  reconnect: true,
  connectionParams: {
    // Pass any arguments you want for initialization
  } 
})

import { getOperationAST } from 'graphql';  
import { App } from './app.component';

const link = ApolloLink.split(
  operation => {
  	const operationAST = getOperationAST(operation.query, operation.operationName);
  	return !!operationAST && operationAST.operation === 'subscription';
  },
  new HttpLink({
    uri: `${document.URL}/graphql`
  }),  
  new WebSocketLink(wsClient),
) 
import { onError } from "apollo-link-error";
import Snackbar from 'react-toolbox/lib/snackbar';
export class AppStore {
  static instance: AppStore
  appComponent:App
  @observable username = 'Mr. User'

  apolloClient = new ApolloClient({
                      link: ApolloLink.from([ onError(({ graphQLErrors, networkError }) => {
                                                      const snackbar = this.appComponent.snackbar as Snackbar 
                                                        if (graphQLErrors)
                                                          graphQLErrors.map(({ message, locations, path }) =>

                                                                    snackbar.setState({active:true,label://console.log(
                                                                        `[ошибка GraphQL]: Message: ${message}, Location: ${locations}, Path: ${path}`
                                                                    })
                                                          )
                                                      if (networkError)// console.log(
                                                        snackbar.setState({active:true,label:`[Ошибка сети]: ${networkError}`})
                                                        })
                                              , link]),
                      cache: new InMemoryCache()
                      })


  constructor(){
   
    console.log(document.domain)


  }
  static getInstance() {
    return AppStore.instance || (AppStore.instance = new AppStore())
  }

  @action onUsernameChange = (val) => {
    this.username = val
  }

}
