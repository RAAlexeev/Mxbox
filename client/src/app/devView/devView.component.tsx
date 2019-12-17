import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { DevicesStore } from '../devices/devices.store'
import { AppStore } from '../app.store'

import RouterStore from '../router.store'
import { DevViewStore } from './devView.store'


@observer
export class DevView extends React.Component<any, any> {

  
  componentWillMount() {
    
    
  }

  componentWillUnmount() {
    
  }

  render() {
    return <DevViewComponent />
    // <Provider devViewStore={this.devViewStore}>
    //return <DevViewComponent />
  //  </Provider>
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
  devViewStore: DevViewStore
  componentWillUnmount() {
    this.devViewStore.destructor();
  }
  render() {
    
    const { devicesStore } = this.props
    //console.log(this.props)
    if(!devicesStore.selected){
      return <div>
        Выбирете устройство!
        </div>
    }
    
      if(this.devViewStore)this.devViewStore.destructor();
      this.devViewStore = new DevViewStore()
    
    switch(devicesStore.selected.type){
      case 0:
        return <div style={{backgroundImage:''}}>

                    Здесь будет мнемосхема ... когда нибудь....
              </div>
   
    default:
      return <div>
        Неизвестный тип устройства!
      </div>
    }
  }
}
