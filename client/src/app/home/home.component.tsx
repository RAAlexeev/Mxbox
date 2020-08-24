import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { HomeStore } from './home.store'
import { AppStore } from '../app.store'
import { DevicesStore } from '../devices/devices.store';
//import { UserProvider } from '../userContext';
import Switch from 'react-toolbox/lib/switch';
import { isUndefined } from 'util';
import Button from 'react-toolbox/lib/button';
import { Input } from 'react-toolbox/lib/input';
import { SmsDialog } from '../dialogs/sms.dialog';
import * as theme from './home.css'

@observer
export class Home extends React.Component<any, any> {


  componentWillMount() {
    DevicesStore.getInstance().select(null)
    DevicesStore.getInstance().initializeDevices()
  }

  render() {
    //const user = { name: 'Tania', loggedIn: true }
    return <Provider homeStore={new HomeStore()}>

      <HomeComponent />

    </Provider>
  }
}

interface HomeComponentProps {
  appStore?: AppStore,
  homeStore?: HomeStore
}


@inject('appStore', 'homeStore')
@observer  class HomeComponent extends React.Component<HomeComponentProps, any> {
  dialogs:{smsDialog?:SmsDialog 
  }={}
  obj={sms:{numbers:[""],text:"ТЕСТ"}}
  smsDialogHandleToggle=()=>{this.dialogs.smsDialog.handleToggle(this.obj,this.props.homeStore.testSMS)}
  
  render() {
   
    const { homeStore, appStore } = this.props
    return <div> 
      <SmsDialog actionLabel1="Отправить..." ref={instance => this.dialogs.smsDialog = instance}/>
        <h2>Конфигуратор системы оповещения и мониторинга MxBox©</h2>
        <p>Позволяет конфигурировать серверную часть системы, создавая "Правила" для устройств, подключенных к MxBox©, и определяя в них события и соответствующие событиям действия.
        Для добавления устройства к перечню подключенных к системе оповещения следует в левой панели основного (первого) экрана нажать курсором (левой клавишей мыши) на красный значок +. Внизу панели добавится поле ввода наименования и Modbus-адреса нового устройства.</p>
        <p>Если устройство уже включено в перечень, выберите его курсором (при этом стрелка курсора превращается в "руку"), откорректируйте при необходимости наименование и адрес Modbus в поле Адрес. После выбора и/или корректировки параметров переведите курсор в на правую (серую) панель экрана и сформируйте/откорректируйте "Правила", руководствуясь выпадающей вкладкой подсказки.</p>
        По всем вопросам и предложениям пишите:<a href="mailto:alekseev@mx-omsk.ru">alekseev@mx-omsk.ru</a>
        
 
 <Input  style={{width:'auto',float:'left'}}   
                    floating
                    type='text'
                    label='Адрес:'
                    name='ip_addr'
                    hint='ya.ru'
                    error=''
                    value={homeStore.ip_addr}
                    onChange={homeStore.set_ip_addr.bind(homeStore)}
                  />
  <Button flat icon="compare_arrows" onClick={homeStore.ping.bind(homeStore)} >ping</Button>
  <Button flat icon="sms" onClick={this.smsDialogHandleToggle.bind(this)} >Тестовая SMS...</Button>          
  <Switch  theme={theme}
            checked={homeStore.ioTest}
            label="тестирование DIO"
            onChange={homeStore.switch_ioTest.bind(homeStore)}
          />
        <p>{homeStore.pingResult}</p>  
       <h2>Информация о системе  <Button flat= {true} icon="replay" onClick={homeStore.loadInfo.bind(homeStore)} /></h2>        
       <p>Регистрация в сети:<b>{homeStore.CREG} </b></p>
       <p> уровень сигнала(RSSI dB (10+ OK)):<b>{homeStore.signalQuality}</b></p>
        { (homeStore.info.ifaces)?
        <table>
         <caption>Сетевые_интерфейсы</caption> 
        <tbody>     
            <tr><th rowSpan={homeStore.info.ifaces.ap0?homeStore.info.ifaces.ap0.lengh:0}>ap0:</th></tr>
            {homeStore.info.ifaces.ap0?homeStore.info.ifaces.ap0.map((item,_key)=>{
                                                                                return<tr key={_key}><td>{item.address}</td><td>{item.netmask}</td><td>{item.mac}</td></tr>
            }):null}
            <tr><th rowSpan={homeStore.info.ifaces.ccmni0?homeStore.info.ifaces.ccmni0.lengh:0}>ccmni0:</th></tr>
            {homeStore.info.ifaces.ccmni0?homeStore.info.ifaces.ccmni0.map((item,_key)=>{
                                                                              return <tr  key={_key}><td>{item.address}</td><td>{item.netmask}</td><td>{item.mac}</td></tr>
            }):null}
        </tbody></table>:null}
        <table><caption>Разное</caption><tbody> 
        <tr><td>firmware:</td><td>{homeStore.info.firmware}</td></tr>
          <tr><td>uptime:</td><td>{homeStore.info.uptime}</td></tr>
          <tr><td>hostname:</td><td>{homeStore.info.hostname}</td></tr>
          <tr><td>freemem:</td><td>{homeStore.info.freemem}</td></tr>
          </tbody></table>
          <table><caption>{homeStore.info.io?"IO":null}</caption><tbody> 
          {homeStore.info.io?homeStore.info.io.map((item,_key)=><tr key={_key}>{_key?<td>{(_key<7?"DI"+_key:"DO"+(_key-6))}</td>:null}<td>{item}</td></tr>
          ):null}
          </tbody></table>

          
        </div>
  }
  
}
