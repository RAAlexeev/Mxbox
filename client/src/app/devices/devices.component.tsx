import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { Card, CardMedia, CardTitle, CardText, CardActions } from 'react-toolbox/lib/card'
import { NavLink, Switch, Route, Router, BrowserRouter } from 'react-router-dom'
import { Button } from 'react-toolbox/lib/button'
import { DevicesStore } from './devices.store'
import { AppStore } from '../app.store'
import * as style from './devices.css'
import * as appStyle from '../app.css'
import { ContextMenu } from './contextenu.componet';
import { Input } from 'react-toolbox/lib/input'
import RouterStore from '../router.store';
import Navigation from 'react-toolbox/lib/navigation';


@observer
export class Devices extends React.Component<any, any> {

  devicesStore: DevicesStore
  componentWillMount() {
    
    this.devicesStore = DevicesStore.getInstance()
  }

  componentWillUnmount() {
   this.devicesStore.destructor()
  }

  render() {
    return <Provider devicesStore={this.devicesStore}>
      <DevicesComponent />
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
export class DevicesComponent extends React.Component<DevicesComponentProps, any> {
  render() {
    
    const { devicesStore, appStore, routerStore } = this.props
    //console.log(this.props)
    return <div>

        <Button icon='add' onClick={devicesStore.addDevice.bind(devicesStore)} floating accent mini className={appStyle.floatRight} />
      
      <h3 style={{margin:'1rem'}}>Hello {appStore.username}</h3>
     <Navigation type='vertical'>
      {devicesStore.devices.map(device =>
        <NavLink key={device._id} to={`/rules/${device.name}/${device._id}`} activeClassName={style.active} isActive={(_, { pathname }) =>{ return pathname === `/rules/${device.name}/:${device._id}`}}>
          <Card    onClick={devicesStore.select.bind(devicesStore ,device)} className={style.messageCard +  ((devicesStore.selected === device)?(' '+ style.activeCard):'')} >
            <CardTitle className ={style.cardTitle}
            title={ ContextMenu( devicesStore, device ) }
            subtitle=''/>  
            <div style={{whiteSpace:'nowrap', width:'100%'}}>          
            <Input 
              disabled = {!(devicesStore.isEdit && devicesStore.selected === device)}
              className={style.addr}
               type='text'
               name='mb_addr'
               label='Адрес:'
               
               error={device.error}
               value={device.mb_addr?device.mb_addr:''}
               maxLength={3} 
               onChange={devicesStore.mb_addrOnChange.bind(this, device, devicesStore)}
              /> 
              <Input 
              disabled = {!(devicesStore.isEdit && routerStore.location.pathname == `/rules/${device.name}/${device._id}`)}
              className={style.ip}
               type='text'
               name='mb_addr'
               label='IP:'
               
              //error={devicesStore.title.error}
               value={device.ip_addr?device.ip_addr:''}
               maxLength={20} 
               onChange={devicesStore.ip_addrOnChange.bind(this, device, devicesStore)}
              />
              </div>
       
        
        </Card> </NavLink> 
        
        )}
          </Navigation>

    </div>

  }
}
