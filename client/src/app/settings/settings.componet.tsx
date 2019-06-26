import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { Input } from 'react-toolbox/lib/input'
import { SettingsStore } from './settings.store'
import { AppStore } from '../app.store'
import { DevicesStore } from '../devices/devices.store';
import {Card, CardTitle, CardText } from 'react-toolbox/lib/card';
import Dropdown from 'react-toolbox/lib/dropdown';
import * as theme from './settings.css'
import { action } from 'mobx';

export class Settings extends React.Component<any, any> {    
  settingsStore: SettingsStore

  componentWillMount() {
   this.settingsStore = new SettingsStore()
   DevicesStore.getInstance().select(null)
  }

  render() {
    return <Provider settingsStore={this.settingsStore}>
      <SettingsComponent />
    </Provider>
  }
}

interface SettingsComponentProps {
  appStore?: AppStore,
  settingsStore?: SettingsStore
}
const params=[{value:'8e1',label:'8e1'},{value:'8n2',label:'8n2'},{value:'8o1',label:'8o1'},{value:'8s2',label:'8s2'}]
@inject('appStore', 'settingsStore')

 @observer  class SettingsComponent extends React.Component<SettingsComponentProps, any> {
  //speeds:[{value:9600,label:9600},{value:19200,label:19200},{value:56700,label:56700},{value:115200,label:115200}]
  state = {

    speed:undefined,
    param:'8e1',
    text:'',
    error:'',
    
   }
  
   onChange=()=>{
   // console.dir(this)
  }
  port1SpeedOnChange = (value)=>{
    this.setState({speed:value});
  }
  render() {
    
    const { settingsStore, appStore } = this.props
    return (
      <div>
          <Card >
            <CardTitle
                avatar=''
                title="Порт №1"
                subtitle="настройки"
              />
              
             <CardText> 
                <div style={{width:'30%', float:"left"}}>
                <Dropdown 
                    auto
                    onChange={settingsStore.onPort1Change.bind(this,0,'speed')}
                    source={[{value:9600,label:9600},{value:19200,label:19200},{value:56700,label:56700},{value:115200,label:115200}]}
                    value={settingsStore.portsSettings[0].speed}
                    theme={theme}
                  />
                  </div>
                 <div style={{width:'30%',float:'left'}}>
                  <Dropdown
                    auto
                    onChange={settingsStore.onPort1Change.bind(this,0,'param')}
                    source={params}
                    value={settingsStore.portsSettings[0].param}
                    theme={theme}
                  />
                </div>

              </CardText> 
          </Card>
          <Card >
            <CardTitle
              avatar=''
              title="Сервер почты"
              subtitle="настройки"
            />
    
     <CardText> 
        <Input
          type='text'
          label='Адрес smtp:'
          name='smtpAddress'
          hint='smtp.yandex.ru'
          error=''
          value={settingsStore.smtpSettings.address}
          onChange={settingsStore.onSmtpChange.bind(this,'address')}
        />        
        <Input
          type='text'
          label='порт:'
          name='smtpPort'
          hint='465'
          error=''
          value={settingsStore.smtpSettings.port}
          onChange={settingsStore.onSmtpChange.bind(this,'port')}
        />
        <Input
          type='text'
          label='Имя пользователя:'
          name='smtpName'
          hint='username'
          error=''
          value={settingsStore.smtpSettings.name}
          onChange={settingsStore.onSmtpChange.bind(this,'name')}
        />
        <Input
          type='password'
          label='Пароль:'
          name='smtpPassword'
          hint='password'
          error=''
          value={settingsStore.smtpSettings.password}
          onChange={settingsStore.onSmtpChange.bind(this,'password')}
        />
   </CardText> 
   </Card>
    </div>)
  }
}
