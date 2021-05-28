import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { AppStore } from '../app.store'
import { DevicesStore } from '../devices/devices.store';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import { RouterStore } from 'mobx-react-router';

@observer
export class Reload extends React.Component<any, any> {


  componentWillMount() {

    DevicesStore.getInstance().select(null)
    
    
   
  }

  render() {
   
    return <Provider devicesStore={DevicesStore.getInstance()}>

      <ReloadComponent />

    </Provider>
  }
}

interface ReloadComponentProps {
  appStore?: AppStore,
  routerStore?:RouterStore
}


@inject('appStore', 'routerStore')
@observer  class ReloadComponent extends React.Component<ReloadComponentProps, any> {
 
  
  render() {
   
   const { routerStore, appStore } = this.props
    setTimeout(()=>routerStore.history.push(`/home`), 60000)
    return <div> 
      Перезагрузка....
    <ProgressBar type="circular" mode="indeterminate" />

          
        </div>
  }
  
}
