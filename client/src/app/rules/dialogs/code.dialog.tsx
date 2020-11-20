import Dialog from 'react-toolbox/lib/dialog';
import React = require('react');
import Input from 'react-toolbox/lib/input';
import { observable } from 'mobx';
import {Trig, TrigsStore} from '../trigs/trigs.store'
import { isBoolean } from 'util';


export class CodeDialog extends React.Component<any> {
 @observable state = {
   active: false,
   code:'',
   coment:'',
   error:''
  }
  curTrig:Trig
  curTrigsStore:TrigsStore

  handleToggle (trig?:Trig, trigsStore?:TrigsStore) {
    this.curTrig = trig
    //console.log('handleToggle:'+trig)
    this.curTrigsStore = trigsStore
    if(trig )
    {
       this.setState({...this.state, error:'', active:!this.state.active, code:trig.condition?trig.condition:'',coment:trig.coment?trig.coment:'' })

    } else
    this.setState({...this.state, active:!this.state.active, error:'',code:'',coment:'' })

  }
  self: this;

  handleOnSave(){
    let code = this.state.code.replace(/\[\d?\s?\d+\.?[01]?[0-5]?[f,u]?\]/g,'(-1.1)').replace(/#DI\d+/g,'(0)')
        .replace(/([^>^<])\=+/g,'$1 === ').replace(/or/ig,'||').replace(/and/ig,'&&').replace(/not/g,'!').replace(/<>/g,'!=')
    try{
      console.log('hadleOnSave:',code ,new Function('return ('+ code +')')())
      if(!isBoolean(new Function('return ('+code+')')()) )throw new Error('выражение не логического типа...')    
      this.curTrig.condition = this.state.code
      this.curTrig.coment = this.state.coment 
      this.curTrigsStore.updTrig( this.curTrig )
      this.handleToggle()
    }catch(err){
      this.setState({... this.state, error:err.toString()}) 
    }
   
  }
  actions = [
    { label: "Сохранить", onClick: this.handleOnSave.bind(this) },
    { label: "Отмена", onClick: this.handleToggle.bind(this) }
  ];
  handleChange(name:string, value:string){
    if(name === 'code'){
      value = value.replace(/[^\+^\-^\*^\/^\>^\<^\=^\s^\]^\[^\d^\.^O^R^A^N^D^T^#^I\(\)]/ig,'')//.replace(/(?<!&)&(?!&)/g, ' && ').replace(/O$/g,'OR ').replace(/N$/g,'NOT ')
    }
    this.setState({...this.state, [name]: value});
  }

  constructor(props) {
    
    super(props)
    //this.onRef = React.createRef();
  
    this.self = this
  }
  elFocus:any 
  componentWillMount() {
  
    if(this.elFocus)(this.elFocus.firstChild as any).focus()
  
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
          
          title='Условие'
        >
      
         <Input style={{marginTop:'10rem'}} type='text' multiline  error={this.state.error} label={ 'Здесь, вы можете вводить условия состоящие из: >, <, =, >=, <= , OR, AND, NOT, \
            () и содержащие числовые константы и арифметические операции +, -, *, / , а также адреса регистров modbus в квадратных скобках:\
            например: ([12] + 4 > 10) AND [12.1] \
            По умолчанию для запросов modbus используется функция 3 — чтение значений из нескольких регистров хранения (Read Holding Registers). \
            Возможно явно указать функцию [4 12] (поддержаны функции 1,2,3 и 4), \
            также возможно использовать квалификаторы типа данных [12u] – для беззнаковых величин uint16, (по умолчанию int16) и [4 12f] – float32. \
            Также возможно извлечь бит из регистра, например [12.9] будет интерпретирован как 0 или 1 в зависимости от состояния бита №9 регистра 12 \
            В выражении возможно использовать #DI1 или #DI2 ... #DI6 которые будут интерпретироваться как состояния дискрентных входов.\
            '}
            /*ref={inst=>{this.elFocus=ReactDOM.findDOMNode(inst);} }*/ value={this.state.code} onChange={this.handleChange.bind(this,'code') }/>

          <Input style={{marginTop:'1rem'}} type='text'    label='Коментарий'
           /* ref={inst=>{const el=ReactDOM.findDOMNode(inst);if(el)(el.firstChild as any).focus()} } */ value={this.state.coment} onChange={ this.handleChange.bind(this,'coment') }/>
 
 
        </Dialog>
      </div>
    )
  }  
}