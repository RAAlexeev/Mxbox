import * as React from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { HomeStore } from './home.store'
import { AppStore } from '../app.store'
import { DevicesStore } from '../devices/devices.store';

@observer
export class Home extends React.Component<any, any> {

  homeStore: HomeStore
  componentWillMount() {
    this.homeStore = new HomeStore()
    DevicesStore.getInstance().select(null)
  }

  render() {
    return <Provider homeStore={this.homeStore}>
      <HomeComponent />
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
    
   // const { homeStore, appStore } = this.props
    return <div>
<h2>Конфигуратор системы оповещения и мониторинга MxBox©</h2>
<p>Позволяет конфигурировать серверную часть системы, создавая "Правила" для устройств, подключенных к MxBox©, и определяя в них события и соответствующие событиям действия.
Для добавления устройства к перечню подключенных к системе оповещения следует в левой панели основного (первого) экрана нажать курсором (левой клавишей мыши) на красный значок +. Внизу панели добавится поле ввода наименования и Modbus-адреса нового устройства.</p>
<p>Если устройство уже включено в перечень, выберите его курсором (при этом стрелка курсора превращается в "руку"), откорректируйте при необходимости наименование и адрес Modbus в поле Адрес. После выбора и/или корректировки параметров переведите курсор в на правую (серую) панель экрана и сформируйте/откорректируйте "Правила", руководствуясь выпадающей вкладкой подсказки.</p>
По всем вопросам и предложениям пишите:<a href="mailto:alekseev@mx-omsk.ru">alekseev@mx-omsk.ru</a>
</div>
  }
}
