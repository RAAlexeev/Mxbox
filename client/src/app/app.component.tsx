import * as React from 'react'
import { NavLink } from 'react-router-dom'
import * as style from './app.css'
import { Layout, NavDrawer, Panel, Sidebar } from 'react-toolbox/lib/layout';
import { AppBar } from 'react-toolbox/lib/app_bar';
import {Devices} from './devices/devices.component'
import { inject } from 'mobx-react';
import{Snackbar} from './snackbar.component'
import { AppStore } from './app.store';
import Button, { BrowseButton } from 'react-toolbox/lib/button';
import Tooltip from 'react-toolbox/lib/tooltip';
import { NumberExchengDialog } from './dialogs/numberExchange.dialog';

const TooltipButton = Tooltip(Button)
const TooltipBrowseButton = Tooltip(BrowseButton)

@inject('devicesStore')
export class App extends React.Component<any, any> {
  snackbar: Snackbar;
  numberExchengDialog:NumberExchengDialog

  componentWillMount() {
  
    AppStore.getInstance().appComponent = this
  }
  renderDevTool() {
    if (process.env.NODE_ENV !== 'production') {
      const DevTools = require('mobx-react-devtools').default
      return (<DevTools />)
    }
  }
  state = {
    drawerActive: true,
    drawerPinned: false,
    sidebarPinned: false
};
toggleDrawerActive = () => {
  this.setState({ drawerActive: !this.state.drawerActive });
  
};

toggleDrawerPinned = () => {
  this.setState({ drawerPinned: !this.state.drawerPinned });
}

toggleSidebar = () => {
  this.setState({ sidebarPinned: !this.state.sidebarPinned });
};
  render() {
    return(  
    <Layout>
        <NavDrawer active={this.state.drawerActive}
                pinned={this.state.drawerPinned} permanentAt='md'
                onOverlayClick={ this.toggleDrawerActive }>
            
            <NavLink to='/home' style={{margin:'1rem'}}  activeClassName={style.active}>Главная</NavLink>
            <NavLink to='/settings' style={{margin:'1rem'}} activeClassName={style.active}>Настройки</NavLink>  
           
            <TooltipButton tooltip='Заменить номер телефона' icon='find_replace' onClick={()=>AppStore.getInstance().numberExchengDialog.handleToggle(AppStore.getInstance().onNumberExchenge) }/>
            <TooltipButton tooltip='Сохранить настройки' icon='save_alt' href={document.location.origin/* .replace(/:3000/,':3001') */+'/download'}/>
            <TooltipBrowseButton  tooltip='Загрузить настройки' icon="file_upload" label="" onChange={({ target: { validity, files: [file] } }) =>AppStore.getInstance().onLoad(file)}
        />
            <Devices {...this.props} />
      </NavDrawer>
      <Panel>
        <AppBar leftIcon='menu' onLeftIconClick={ this.toggleDrawerActive } theme={style} >
        <h1 style={{marginLeft: '10px'}}>MxBox&copy;	&ndash; OOO НТФ "Микроникс"</h1>
        </AppBar> 
              <div style={{ flex: 1, overflowY: 'visible', padding: '1.8rem' }}>
                <div className={style.container}>
                  {this.props.children}
                  { /* this.renderDevTool() */ }
                  </div>
              </div>
        </Panel>
      <Snackbar ref={inst=>this.snackbar=inst} />
    </Layout>
    )};
}
