import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { Input } from 'react-toolbox/lib/input'
import { SettingsStore } from './settings.store'
import { AppStore } from '../app.store'
import { DevicesStore } from '../devices/devices.store';
import {Card, CardTitle, CardText } from 'react-toolbox/lib/card';

@observer
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

@inject('appStore', 'settingsStore')
@observer
export class SettingsComponent extends React.Component<SettingsComponentProps, any> {
  render() {
    
    const { settingsStore, appStore } = this.props
    return <div>
            <Card >
            <CardTitle
      avatar='avatar.png'
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
          value={settingsStore.smtpAddress}
          onChange={settingsStore.onSmtpChange.bind(this,'smtpAddress')}
        />        
        <Input
          type='text'
          label='порт:'
          name='smtpPort'
          hint='465'
          error=''
          value={settingsStore.smtpPort}
          onChange={settingsStore.onSmtpChange.bind(this,'smtpPort')}
        />
        <Input
          type='text'
          label='Имя пользователя:'
          name='smtpName'
          hint='username'
          error=''
          value={settingsStore.smtpName}
          onChange={settingsStore.onSmtpChange.bind(this,'smtpName')}
        />
        <Input
          type='password'
          label='Пароль:'
          name='smtpPassword'
          hint='password'
          error=''
          value={settingsStore.smtpPassword}
          onChange={settingsStore.onSmtpChange.bind(this,'smtpPassword')}
        />
   </CardText> 
   </Card>
    </div>
  }
}
