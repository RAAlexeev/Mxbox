import Dialog from 'react-toolbox/lib/dialog';
import React = require('react');
import Input from 'react-toolbox/lib/input';
import Autocomplete from 'react-toolbox/lib/autocomplete';
import {DevicesStore} from '../../devices/devices.store'
export class EmailDialog extends React.Component<any> {
state = {
   active: false,
   address:'',
   subject:'',
   body:'',
   error:'',
   directory:[]
  }
 
  upd:Function
  obj
  handleToggle = ( obj?,upd?:Function ) => {
    console.log(obj)
    this.upd = upd
    this.obj = obj
 
    if( obj ){
    if( !obj.email ) obj.email = { address:'', subject:'', body:'' }
     
    this.setState( { ...this.state,address:obj.email.address, subject:obj.email.subject, body:obj.email.body, active:!this.state.active } )
    

    } else  this.setState( { ...this.state,address:'', subject:'', body:'', active:!this.state.active } )
  
   

  }

  handleOnSave(){ 
    this.obj.email = {address:this.state.address, subject:this.state.subject, body:this.state.body}
    this.upd(this.obj)
    this.handleToggle()
  }
  actions = [
    { label: "Сохранить", onClick: this.handleOnSave.bind(this) },
    { label: "Отмена", onClick: this.handleToggle }
  ]
  handleChange(name:string, value:string){
   
    this.setState({...this.state, [name]: value})
  }
  constructor(props) {
    
    super(props)


  }

  async componentWillMount() {
   await DevicesStore.getInstance().getDirectory()
   this.setState({...this.state, directory: DevicesStore.getInstance().directory.address})
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
          title='Email'
        >
         <section>
         <Autocomplete
         icon='email'
          direction="down"
          label="Кому:"
          hint=""
          multiple={false}
          onChange={this.handleChange.bind(this, 'address')}
          onQueryChange={this.handleChange.bind(this, 'address')}
          value={this.state.address}
          allowCreate={true}
          source={this.state.directory}
        />
         <Input type='text' label='Тема' icon='subject' value={this.state.subject} onChange={this.handleChange.bind(this, 'subject')} />
         <Input type='text' multiline rows={10} error={this.state.error} hint='Здесь вы  также можете вставлять ссылки на modbus адреса в квадратных скобках [03 12], [12f](p.s. и в теме тоже)'
                icon='email' value={this.state.body} onChange={this.handleChange.bind(this,'body') }/>  
        </section>
        </Dialog>
     </div>
    )
  }
}