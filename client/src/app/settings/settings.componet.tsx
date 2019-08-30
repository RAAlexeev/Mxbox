import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { Input } from 'react-toolbox/lib/input'
import { SettingsStore } from './settings.store'
import { AppStore } from '../app.store'
import { DevicesStore } from '../devices/devices.store';
import {Card, CardTitle, CardText } from 'react-toolbox/lib/card';
import Dropdown from 'react-toolbox/lib/dropdown';
import * as theme from './settings.css'
import { BrowseButton } from 'react-toolbox/lib/button';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';


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
const params=[{value:'8e1',label:'8 чет 1'},{value:'8n2',label:'8 нет 2'},{value:'8o1',label:'8 нечет 1'},{value:'8s1',label:'8 пробел 1'}]
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
    this.setState({...this.state, speed:value});
  }
  render() {
    
    const { settingsStore, appStore } = this.props
    return (
      <div>
          <Card>
            <CardTitle
                avatar=''
                title="Порты"
                subtitle="настройки"
              />
              
             <CardText> 
                <div style={{width:'30%', float:"left"}}>
                <Dropdown 
                    auto
                    label={'Скорость'}
                    onChange={settingsStore.onPort1Change.bind(this,'speed')}
                    source={[{value:9600,label:9600},{value:19200,label:19200},{value:56700,label:56700},{value:115200,label:115200}]}
                    value={settingsStore.portsSettings[0].speed?settingsStore.portsSettings[0].speed:''}
                    theme={theme}
                  />
                  </div>
                 <div style={{width:'30%',float:'left'}}>
                  <Dropdown
                    auto
                    label={'Параметры'}
                    onChange={settingsStore.onPort1Change.bind(this,'param')}
                    source={params}
                    value={settingsStore.portsSettings[0].param?settingsStore.portsSettings[0].param:''}
                    theme={theme}
                  />
                </div>

              </CardText> 
          </Card>
          <Card>
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
          value={settingsStore.smtpSettings.address?settingsStore.smtpSettings.address:''}
          onChange={settingsStore.onSmtpChange.bind(this,'address')}
        />        
        <Input
          type='number'
          label='порт:'
          name='smtpPort'
          hint='465'
          error=''
          value={settingsStore.smtpSettings.port?settingsStore.smtpSettings.port:''}
          onChange={(value)=>{settingsStore.onSmtpChange('port',parseInt(value))}}
        />
        <Input
          type='text'
          label='Имя пользователя:'
          name='smtpName'
          hint='username'
          error=''
          value={settingsStore.smtpSettings.name?settingsStore.smtpSettings.name:''}
          onChange={settingsStore.onSmtpChange.bind(this,'name')}
        />
        <Input
          type='password'
          label='Пароль:'
          name='smtpPassword'
          hint='password'
          error=''
          value={settingsStore.smtpSettings.password?settingsStore.smtpSettings.password:''}
          onChange={settingsStore.onSmtpChange.bind(this,'password')}
        />
   </CardText> 
   </Card>
   <Card>
            <CardTitle
              avatar=''
              title="Обновление"
              subtitle=""
            />
    
     <CardText> 


 
     <BrowseButton
          icon="file_upload"
          label="Файл"
          onChange={({ target: { validity, files: [file] } }) =>settingsStore.onUpload(file)}
        />

      </CardText> 
      
   </Card>
    </div>)
  }
}
