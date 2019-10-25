import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { Card, CardMedia, CardTitle, CardText, CardActions } from 'react-toolbox/lib/card'
import { NavLink, Switch, Route, Router, BrowserRouter } from 'react-router-dom'
import { Button } from 'react-toolbox/lib/button'
import { DevicesStore } from '../devices/devices.store'
import { AppStore } from '../app.store'

import { Input } from 'react-toolbox/lib/input'
import RouterStore from '../router.store';
import Navigation from 'react-toolbox/lib/navigation';
import { Subscription } from "react-apollo"
import gql from 'graphql-tag';

@observer
export class DevView extends React.Component<any, any> {

  devicesStore: DevicesStore
  componentWillMount() {
    
    this.devicesStore = DevicesStore.getInstance()
  }

  componentWillUnmount() {
   this.devicesStore.destructor()
  }

  render() {
    return <Provider devicesStore={this.devicesStore}>
      <DevViewComponent />
    </Provider>
  }
}

interface DevicesComponentProps {
  appStore?: AppStore,
  devicesStore?: DevicesStore,
  routerStore?:RouterStore
}

@inject('appStore','devicesStore', 'routerStore')
@observer
export class DevViewComponent extends React.Component<DevicesComponentProps, any> {
  render() {
    
    const { devicesStore, appStore, routerStore } = this.props
    //console.log(this.props)
    return <div>
          <Subscription
    subscription={gql`subscription  updDNK4ViewData()`}
    variables={{  }}
  >
    {({ data: { N1 }, loading }) => (
      <h4>New data: {!loading && N1.on}</h4>
      
    )}
  </Subscription>
        
    </div>

  }
}
