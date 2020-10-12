import Dialog from 'react-toolbox/lib/dialog';
import React = require('react');
import Dropdown from 'react-toolbox/lib/dropdown';
import { Act } from '../acts/acts.store';
import * as style from './dialogs.css'


export class ErrorDialog extends React.Component {
  onSave:Function
  act:Act
   state = {
    active: false,
    DO:[-1,-1,-1]
  };

  handleToggle = (act?:Act,onSave?:Function) => {
    this.onSave = onSave
    this.act = act
    console.log('DoDialog.act:',act)
    this.setState({...this.state,active: !this.state.active, DO:act&&act.DO?act.DO:this.state.DO});
  }
  handleChange = (num, value) =>{
    this.setState(state=>{ return {...state,DO:this.state.DO.map((item,i)=>{return i===num?value:item })}})
  }
  actions = [
    { label: "Отмена", onClick: this.handleToggle },
    { label: "Сохранить", onClick: ()=>{ if(this.onSave){this.onSave({...this.act,DO:this.state.DO});} this.handleToggle()} }
  ];

  render () {
    //const values = [{label:'Не изменять состояние',value:-1},{label:'Установить в 0',value:0},{label:'Установить в 1',value:1},{label:'Импульс => 1',value:2}, {label:'Импульс => 0',value:3}]
    return (
      <div>

      </div>
    );
  }
}