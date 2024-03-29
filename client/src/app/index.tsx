import * as React from 'react'
import * as ReactDOM from 'react-dom'
import "es6-promise/auto"
import { Provider } from 'mobx-react'
import { Router, Route, Redirect, Switch } from 'react-router-dom'
import { App } from './app.component'
import { AppStore } from './app.store'
import { RouterStore } from './router.store'
import { Home } from './home/home.component'
import { DevRules } from './rules/rules.component';
import { DevView } from './devView/devView.component';
import { DevicesStore } from './devices/devices.store';
import { Settings } from './settings/settings.component';
import { NumberExchengDialog } from './dialogs/numberExchange.dialog';
import { Reload } from './reload/reload.component'
//import 'material-design-icons/iconfont/material-icons.css'

const appStore = AppStore.getInstance()
const routerStore = RouterStore.getInstance()
const devicesStore =  DevicesStore.getInstance()
const rootStores = {
  appStore,
  routerStore,
  devicesStore
}

ReactDOM.render(
   <Provider appStore={ appStore } routerStore={ routerStore } devicesStore={devicesStore} >
      <Router history={ routerStore.history } >
      <App>
        <NumberExchengDialog rootStores={rootStores}  ref={ instance =>  appStore.numberExchengDialog = instance } />  
        <Switch >
        <Route exact path='/upload' component={Reload as any} />
          <Route exact path='/home' component={Home as any} />
          <Route exact path='/settings' component={Settings as any} />
          <Route exact path={"/rules/:id"} component={DevRules as any} />
          <Route exact path={"/views"} component={DevView as any} />
          <Route exact path={"/views/:id"} component={DevView as any} />
          <Redirect from='/' to='/home' />
        </Switch>
      </App>
    </Router>
  </Provider > 

,document.getElementById('root')
)
