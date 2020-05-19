import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { HomeStore } from './home.store'
import { AppStore } from '../app.store'
import { DevicesStore } from '../devices/devices.store';
import { UserProvider } from '../userContext';



import { isUndefined } from 'util';
import Button from 'react-toolbox/lib/button';


@observer
export class Home extends React.Component<any, any> {

  homeStore: HomeStore
  componentWillMount() {

    DevicesStore.getInstance().select(null)
  }

  render() {
    const user = { name: 'Tania', loggedIn: true }
    return <Provider homeStore={new HomeStore()}>
      <UserProvider value={user}>
      <HomeComponent />
      </UserProvider>
    </Provider>
  }
}

interface HomeComponentProps {
  appStore?: AppStore,
  homeStore?: HomeStore
}

@inject('appStore', 'homeStore')
@observer
export class HomeComponent extends React.Component<HomeComponentProps, any> {

  render() {
 /*    const  obj2htmltable =(obj) =>{
      var html = '<table>';
      for (var key in obj) {
          var item = obj[key];
          var value = (typeof(item) === 'object') ? obj2htmltable(item) : item.toString();
          html += '<tr><td>' + key + '</td><td>' + value + '</tr>';
      }
      html += '</table>';
      return html;
  }
    const { homeStore, appStore } = this.props
    const props = {
      dangerouslySetInnerHTML: { __html: obj2htmltable(homeStore.info) },
    }; */
      
    const { homeStore, appStore } = this.props
    return <div>
        <h2>Конфигуратор системы оповещения и мониторинга MxBox©</h2>
        <p>Позволяет конфигурировать серверную часть системы, создавая "Правила" для устройств, подключенных к MxBox©, и определяя в них события и соответствующие событиям действия.
        Для добавления устройства к перечню подключенных к системе оповещения следует в левой панели основного (первого) экрана нажать курсором (левой клавишей мыши) на красный значок +. Внизу панели добавится поле ввода наименования и Modbus-адреса нового устройства.</p>
        <p>Если устройство уже включено в перечень, выберите его курсором (при этом стрелка курсора превращается в "руку"), откорректируйте при необходимости наименование и адрес Modbus в поле Адрес. После выбора и/или корректировки параметров переведите курсор в на правую (серую) панель экрана и сформируйте/откорректируйте "Правила", руководствуясь выпадающей вкладкой подсказки.</p>
        По всем вопросам и предложениям пишите:<a href="mailto:alekseev@mx-omsk.ru">alekseev@mx-omsk.ru</a>

 

 
 <h2>Информация о системе  <Button flat= {true} icon="replay" onClick={homeStore.loadInfo.bind(this)} /></h2>
        уровень сигнала(RSSI dB (> 9 OK)):{homeStore.signalQuality}
        { isUndefined( homeStore.info.ifaces )?null:<table>
         <caption>Сетевые_интерфейсы</caption> 
        <tbody>
       <table><tbody><tr><th class={{rowspan:`${homeStore.info.ifaces.ap0?homeStore.info.ifaces.ap0.lengh:0}`}}>ap0:</th> </tr>{homeStore.info.ifaces.ap0?homeStore.info.ifaces.ap0.map((item,_key)=>{
                                                                            return<tr key={_key}><td>{item.address}</td><td>{item.netmask}</td><td>{item.mac}</td></tr>
        }):null}</tbody></table>
        <table><tbody><tr><th class={{rowspan:`${homeStore.info.ifaces.ccmni0?homeStore.info.ifaces.ccmni0.lengh:0}`}}>ccmni0:</th></tr>{homeStore.info.ifaces.ccmni0?homeStore.info.ifaces.ccmni0.map((item,_key)=>{
                                                                            return <tr  key={_key}><td>{item.address}</td><td>{item.netmask}</td><td>{item.mac}</td></tr>
        }):null}</tbody></table></tbody></table>}
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
