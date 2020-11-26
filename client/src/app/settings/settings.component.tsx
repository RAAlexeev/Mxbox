import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { Input } from 'react-toolbox/lib/input'
import { SettingsStore } from './settings.store'
import { DevicesStore } from '../devices/devices.store';
import {Card, CardTitle, CardText } from 'react-toolbox/lib/card';
import Dropdown from 'react-toolbox/lib/dropdown';
import * as theme from './settings.css'
import Button, { BrowseButton } from 'react-toolbox/lib/button';
import {Tab, Tabs} from 'react-toolbox/lib/tabs';
import { EmailDialog } from '../dialogs/email.dialog'
import { RouterStore } from 'mobx-react-router'
import Switch from 'react-toolbox/lib/switch';





export class Settings extends React.Component<any, any> {    
 

  componentWillMount() {
   DevicesStore.getInstance().select(null)
  }

  render() {
    return <Provider  settingsStore={ new SettingsStore() }>
      <SettingsComponent />
    </Provider>
  }
}

interface SettingsComponentProps {
  routerStore?: RouterStore,
  settingsStore?: SettingsStore
}

const params=[{value:'8e1',label:'8 чет 1'},{value:'8n2',label:'8 нет 2'},{value:'8o1',label:'8 нечет 1'},{value:'8s1',label:'8 пробел 1'}]
 @inject('routerStore', 'settingsStore')
 @observer  class SettingsComponent extends React.Component<SettingsComponentProps, any> {
  //speeds:[{value:9600,label:9600},{value:19200,label:19200},{value:56700,label:56700},{value:115200,label:115200}]
  state = {

    speed:undefined,
    param:'8e1',
    portocol: '',
    index: 0,

  };

  handleChange = (portocol) => {
    this.setState({... this.state, portocol});
  };
  handleTabChange = (index) => {
    this.setState({index});
  };

  componentWillMount() {
  
  }
  dialogs : {emailDialog?:EmailDialog }={}
  tstEmail={email:{address:"",subject:"mxBox ТЕСТ",body:"тест"}}
  emailDialogHandleToggle(settingsStore){this.dialogs.emailDialog.handleToggle(this.tstEmail,settingsStore.testEmail)}
  render() {
    

    const speedList = [{value:9600,label:"9600"},{value:19200,label:"19200"},{value:38400,label:"38400"},{value:57600,label:"57600"},{value:115200,label:"115200"}]
    //const speedList = {'9600':'9600','19200':'19200','38400':'38400','57600':'57600','115200':'115200'}
 
    const { settingsStore, routerStore } = this.props
    
    return (
       <section>
         
         <EmailDialog  actionLabel1="Отправить..." ref={ instance =>  this.dialogs.emailDialog = instance }/>

          <Tabs index={this.state.index} onChange={this.handleTabChange}>

          <Tab label='Общие'>
            <div>
            <div style={{width:'auto', float:"left"}}>
            <Switch  theme={theme}
        checked={settingsStore.settings.pingWatchDogEnable}
        label="ping (раз в час ya.ru) - reboot при неудаче"
        onChange={settingsStore.switchPingWatch.bind(settingsStore)}
      /></div>
          <Input 
          theme={theme}
          maxLength={5}
          type='text'
          label="раз"
          name='Ping'
          hint=''
          error=''
          value={settingsStore.settings.maxCntReboot}
          onChange={settingsStore.setRebootCnt.bind(settingsStore)}
        > </Input>

</div>
          <Card>
            <CardTitle 
                avatar=''
                title="Порт1 (RS485-1)"
                subtitle="Параметры"
              />

             <CardText> 

                <div style={{width:'auto', float:"left"}}>
                <Dropdown 
                    auto
                    label={'Скорость:'}
                    onChange={settingsStore.onPort2Change.bind(null,'speed')}
                    source={speedList}
                    value={settingsStore.portsSettings[1]?settingsStore.portsSettings[1].speed:''}
                    theme={theme}
                  />
                  </div>
                 <div style={{width:'auto',float:'left'}}>
                  <Dropdown
                    auto
                    label={'Параметры:'}
                    onChange={settingsStore.onPort2Change.bind(null,'param')}
                    source={params}
                    value={settingsStore.portsSettings[1]?settingsStore.portsSettings[1].param:''}
                    theme={theme}
                  />
                  </div>
                  <div style={{width:'auto',float:'left'}}>
                    <Dropdown 
                    auto
                    label={'Протокол:'}
                    onChange={settingsStore.onPort2Change.bind(null,'protocol')}
                    source={[{value:0,label:'транслятор'},{value:1,label:'транслятор+модем'},{value:2,label:'модем'}]}
                    value={settingsStore.portsSettings[1]?settingsStore.portsSettings[1].protocol:0}
                    theme={theme}
                    />
                  </div>
                  <div style={{width:'auto',float:'left'}}>
                  <Input
                    type='text'
                    label='адрес ус-ва:'
                    name='mbAddress'
                    hint=''
                    error=''
                    value={settingsStore.portsSettings[1]?settingsStore.portsSettings[1].addr:200}
                    onChange={settingsStore.onPort2Change.bind(null,'addr')}
                  />
            </div>
              </CardText> 
          </Card>
          <Card>
            <CardTitle
                avatar=''
                title="Порт2 (RS485-2)"
                subtitle="Параметры"
              />
             
             <CardText> 
                <div style={{width:'30%', float:"left"}}>
                <Dropdown 
                   
                    label={'Скорость:'}
                    onChange={settingsStore.onPort1Change.bind(null,'speed')}
                    source={speedList}
                    value={settingsStore.portsSettings[0].speed?settingsStore.portsSettings[0].speed:''}
                    theme={theme}
                  />
                  </div>
                 <div style={{width:'30%',float:'left'}}>
                  <Dropdown
                    auto
                    label={'Параметры'}
                    onChange={settingsStore.onPort1Change.bind(null,'param')}
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
            >
              <Button flat icon="email" onClick={this.emailDialogHandleToggle.bind(this,settingsStore)} >Тестовое Email...</Button> 
            </CardTitle>
    
     <CardText> 
        <Input
          type='text'
          label='Адрес почтового сервера (smtp):'
          name='smtpAddress'
          hint='smtp.yandex.ru'
          value={settingsStore.smtpSettings.address?settingsStore.smtpSettings.address:''}
          onChange={settingsStore.onSmtpChange.bind(null,'address')}
        />        
        <Input
          type='number'
          label='порт:'
          name='smtpPort'
          hint='465'
          value={settingsStore.smtpSettings.port?settingsStore.smtpSettings.port:''}
          onChange={(value)=>{settingsStore.onSmtpChange('port',parseInt(value))}}
        />
        <Input
          type='text'
          label='Имя пользователя:'
          name='smtpName'
          hint='username'
          value={settingsStore.smtpSettings.name?settingsStore.smtpSettings.name:''}
          onChange={settingsStore.onSmtpChange.bind(this,'name')}
        />
        <Input
          type='password'
          label='Пароль:'
          name='password'
          hint='password'
          value={settingsStore.smtpSettings.password}
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
          onChange={({ target: { validity, files: [file] } }) =>{settingsStore.onUpload(file)/*routerStore.history.push(`/reload`)*/} }
        />
        <form encType='multipart/form-data' method='post' ref='uploadForm' action='/upload' >
        <input name="fProc" type="file" />
        <input type="submit" ></input>
        </form>
      </CardText> 
      
   </Card>
   </Tab>
   <Tab label='APN'>
        <Card>
            <CardTitle
                avatar=''
                title="APN"
                subtitle="Параметры"
              />
              
             <CardText> 
             <div style={{width:'20%', float:"left"}}>
                <Input
                    type='text'
                    label='APN'
                    name='apn'
                    hint='Точка доступа'
                    error=''
                    value={settingsStore.APN.apn}
                    onChange={settingsStore.onAPNChange.bind(settingsStore,'apn')}
        
                  />
                  
                  </div>
              <div style={{width:'20%', float:"left"}}>
                <Input
                    type='text'
                    label='MCC'
                    name='mcc'
                    hint=''
                    error=''
                    value={settingsStore.APN.mcc}
                    onChange={settingsStore.onAPNChange.bind(settingsStore,'mcc')}
        
                  />
                  
                  </div>
                  <div style={{width:'20%', float:"left"}}>
                  <Input
                    type='text'
                    label='MNC'
                    name='mnc'
                    hint=''
                    error=''
                    value={settingsStore.APN.mnc}
                    onChange={settingsStore.onAPNChange.bind(settingsStore,'mnc')}
                  />
                  
                  </div>
                  <div style={{width:'20%', float:"left"}}>
                    <Input
                      type='text'
                      label='Имя пользявателя'
                      name='user'
                      hint=''
                      error=''
                      value={settingsStore.APN.user}
                      onChange={settingsStore.onAPNChange.bind(settingsStore,'user')} />
                  </div>
                  <div style={{width:'20%', float:"left"}}>
                    <Input
                      type='password'
                      label='Пароль'
                      name='password'
                      hint=''
                      error=''
                      value={settingsStore.APN.password}
                      onChange={settingsStore.onAPNChange.bind(settingsStore,'password')}
                    />                  
                  </div>
                  <Button flat icon="" onClick={settingsStore.applyAPNreboot.bind(settingsStore)} >Применить и перезагрузить</Button> 

              </CardText> 

          </Card>
          </Tab>
          <Tab label="Wifi">
            <Card>
              <CardTitle
                  avatar=''
                  title="WiFi"
                  subtitle="Параметры"
                />  
              <CardText> 
              <div style={{width:'20%', float:"left"}}>
                <Input
                    type='text'
                    label='SSID'
                    name='SSID'
                    hint=''
                    error=''
                    value={settingsStore.WiFi.SSID}
                    onChange={settingsStore.onWiFiChange.bind(settingsStore,"SSID")}
        
                  />
                  </div>
                  <div style={{width:'20%', float:"left"}}>
                    <Input
                      type='password'
                      label='Пароль'
                      name='PSK'
                      hint='PSK'
                      error=''
                      value={settingsStore.WiFi.PSK}
                      onChange={settingsStore.onWiFiChange.bind(settingsStore,"PSK")}
                    />                  
                  </div>
              </CardText>
            </Card>

          </Tab>
   </Tabs>
    </section>)
  }
}
