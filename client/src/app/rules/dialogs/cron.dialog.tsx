import Dialog from 'react-toolbox/lib/dialog';
import React = require('react');
import Input from 'react-toolbox/lib/input';
import { observable } from 'mobx';
import Button from 'react-toolbox/lib/button';
import * as appStyle from '../../app.css'
import {Trig } from "../trigs/trigs.store";
import { Component } from 'react';
import ReactDOM = require('react-dom');




export class CronDialog extends React.Component<any> {

 @observable state = {
   active: false,
   cron:'',
   error:''
  }  
  upd:Function
  obj
  handleToggle = (obj?,upd?) => {
    
    this.upd = upd
   
    this.obj = obj
    if(obj){
      if(!obj.cron) obj.cron = ''
           this.setState({...this.state, cron:obj.cron})
    }else  this.setState({...this.state, cron:''})

    //console.log(this.obj)
   
    this.setState({active:!this.state.active});
  }


  handleOnSave(){
    const cron = this.state.cron.replace(/(\d)\*/g,'$1 *').match(/([\d+\,\-\*]+)/g)
    if(cron.length != 6){
       this.setState({...this.state, error:'неверный формат'})
      return
      }
    this.obj.cron = this.state.cron
    this.upd(this.obj)
    this.handleToggle()
  }
  actions = [
    { label: "Сохранить", onClick: this.handleOnSave.bind(this) },
    { label: "Отмена", onClick: this.handleToggle.bind(this) }
  ]
  handleChange=(name:string, value:string)=>{
    value=value.replace(/[^\*^\d+^\-^\,^\s]/g,'')
    const cron = value.replace(/(\d)\*/g,'$1 *').match(/([\d+\,\-\*]+)/g)
    let test=(s:string, max:number, min?:number )=>{
          if(!s) return false
          let split
          if( s.search('-') )
            split = s.split('-')
          else  if( s.search(',') )
            split = s.split(',')
            for(let i=0; i < split.length;i++){
            const el =  parseInt(split[i])
            if( el > max || el < min)
                return true
            }    
            return false
          }
    let error = ''
     if( cron && cron.length > 0  && (test(cron[0], 59) || test(cron[1],59) || test(cron[2],23) ||  test(cron[3],31,1) || test(cron[4],12,1) || test(cron[5],7)) ){
      error='нерный формат'
     }
      
    
    this.setState({...this.state, error:error, [name]:value})

      
  }

  constructor(props) {
    
    super(props)


  }

  componentDidMount() {

  }
  componentDidUpdate(){

 }

  componentWillUnmount() {
   
  }
  render () {
    
     return (
      <div>
        <Dialog
          actions={this.actions}
          active={this.state.active}
          onEscKeyDown={this.handleToggle}
          onOverlayClick={this.handleToggle}
          title='Расписание'
        >     
           <pre style={{marginLeft:'5rem'}}> <code>{`
# ┌────────────── секунды  0-59
# │ ┌──────────── минуты 0-59
# │ │ ┌────────── часы 0-23
# │ │ │ ┌──────── дни 1-31
# │ │ │ │ ┌────── месяцы 1-12
# │ │ │ │ │ ┌──── дни недели 1-7
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *`}
          </code>
          </pre>
          <Input  style={{minHeight:'3rem'}} ref={inst=>{const el=ReactDOM.findDOMNode(inst);if(el)(el.firstChild as any).focus()} } type='text' error={this.state.error} hint='например: * 2,5,7  * * 0-2  означает: в 2,5 и 7 часов по воскр-ям,пон-ам,втор-ам' icon='alarm' value={this.state.cron} onChange={ this.handleChange.bind(this,'cron') }  maxLength={50} />
        </Dialog>
      </div>
    )
  }


}