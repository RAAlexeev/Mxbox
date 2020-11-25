import * as React from 'react'
import { NavLink } from 'react-router-dom'
import * as style from './app.css'
import { Layout, NavDrawer, Panel } from 'react-toolbox/lib/layout';
import { AppBar } from 'react-toolbox/lib/app_bar';
import {Devices} from './devices/devices.component'
import { inject } from 'mobx-react';
import{Snackbar} from './snackbar.component';
import { AppStore } from './app.store';
import Button, { BrowseButton } from 'react-toolbox/lib/button';
import Tooltip from 'react-toolbox/lib/tooltip';
import { NumberExchengDialog } from './dialogs/numberExchange.dialog';

const TooltipButton = Tooltip(Button)
const TooltipBrowseButton = Tooltip(BrowseButton)

@inject('appStore','routerStore')
export class App extends React.Component<any, any> {
  snackbar: Snackbar;
  numberExchengDialog:NumberExchengDialog
  timestamp: Date;

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
    const {appStore, routerStore}= this.props
    return(  
    <Layout>
        <NavDrawer active={this.state.drawerActive}
                pinned={this.state.drawerPinned} permanentAt='md'
                onOverlayClick={ this.toggleDrawerActive }>
            
        { window.location.pathname.search('views')<0?<div>
    
           <NavLink to='/home' style={{margin:'3rem'}}  activeClassName={style.active}>Главная</NavLink>
           
            <NavLink to='/settings' style={{margin:'3rem'}} activeClassName={style.active}>Настройки</NavLink>  
           
            <TooltipButton tooltip='Заменить номер телефона' icon='find_replace' onClick={()=>appStore.numberExchengDialog.handleToggle(appStore.onNumberExchenge) }/>
           
            <TooltipButton tooltip='Сохранить настройки' icon='save_alt' href={document.location.origin/* .replace(/:3000/,':3001') */+'/download'}/>
           
            <TooltipBrowseButton  tooltip='Загрузить настройки' icon="file_upload" label="" onChange={({ target: { validity, files: [file] } }) =>{if(appStore.onLoad(file)){routerStore.history.push(`/reload`)}}}/>
            </div>:null}
            <Devices  />
      </NavDrawer>
      <Panel>
        <AppBar leftIcon='menu' onLeftIconClick={ this.toggleDrawerActive } theme={style} >
        <h1 style={{marginLeft: '10px'}}>MxBox&copy;	&ndash; OOO НТФ "Микроникс"</h1>
        {this.timestamp?<div style={{textAlign:"right",float:"right",width:"50%"}}>{`Обновлено:${this.timestamp.toLocaleDateString()+' '+this.timestamp.toLocaleTimeString()}`}</div>:null}
        </AppBar> 
              <div style={{ flex: 1, overflowY: 'visible', padding: '1.8rem' }}>
                <div className={style.container}>
                  {this.props.children}
                  { /* this.renderDevTool() */ }
                  </div>
              </div>
        </Panel>
      <Snackbar  ref={inst=>this.snackbar=inst} />
    </Layout>
    )};
}
