import Dialog from 'react-toolbox/lib/dialog';
import React = require('react');
import * as appStyle from '../../app.css'
import Autocomplete from 'react-toolbox/lib/autocomplete';
import { DevicesStore } from '../devices/devices.store';


export class NumberExchengDialog extends React.Component<any> {

  state = {
   active: false,
   sNumber:'',
   dNumber:'',  
   sEmail:'',
   dEmail:'',
   error:'',
   directoryNumber:[] ,
   directoryEmail:[] 
  }

  upd:Function
    handleToggle = ( upd?:Function ) => {
    if( upd )
    this.upd = upd
    this.setState( { ...this.state, active:!this.state.active, sNumber:'', dNumber:'' } );
    //console.log(this.obj)
  }
  handleOnSave(){ 
  //  this.obj.sms = {numbers:this.state.numbers.map((number, index)=>number!=''||!index?number:undefined), text:this.state.text}
  console.log('qweqwe',this.upd)
  if( this.upd ){  
    this.upd( this.state.sNumber, this.state.dNumber,this.state.sEmail ,this.state.dEmail)
    this.props.routerStore.history.push(`/home`)
  }
    this.handleToggle()
  }
  actions = [
    { label: "Заменить", onClick: this.handleOnSave.bind(this,null) },
    { label: "Отмена", onClick: this.handleToggle.bind(this,null) }
  ]
  handleChange(name:string, value:string){
     this.setState({ ...this.state, [name]: value })
     
  }

  constructor(props) {
    
    super(props)

  }

  async componentWillMount() {
   await DevicesStore.getInstance().getDirectory()
    this.setState({...this.state, directoryNumber: DevicesStore.getInstance().directory.numbers,directoryEmail: DevicesStore.getInstance().directory.address})
    
   
    
  }

  componentWillUnmount() {

  }
  render () {
    return (
      <div>
      
        <Dialog
          actions={this.actions}
          active={this.state.active}
          onEscKeyDown={this.handleToggle.bind(this)}
          onOverlayClick={this.handleToggle.bind(this)}
          title='Замена ...'
        >
        
                    <Autocomplete 
                     icon='phone'
                     direction="down"
                     label="Исходный:"
                     hint=""
                     multiple={false}
                     onChange={this.handleChange.bind(this, 'sNumber')}
                     onQueryChange={this.handleChange.bind(this, 'sNumber')}
                     value={this.state.sNumber}
                     allowCreate={true}
                     source={this.state.directoryNumber}
                     
                   />
                   <Autocomplete 
                     icon='phone'
                     direction="down"
                     label="Замена:"
                     hint=""
                     multiple={false}
                     onChange={this.handleChange.bind(this, 'dNumber')}
                     onQueryChange={this.handleChange.bind(this, 'dNumber')}
                     value={this.state.dNumber}
                     allowCreate={true}
                     source={this.state.directoryNumber}
                     
                   />
                    <Autocomplete 
                     icon='email'
                     direction="down"
                     label="Исходный:"
                     hint=""
                     multiple={false}
                     onChange={this.handleChange.bind(this, 'sEmail')}
                     onQueryChange={this.handleChange.bind(this, 'sEmail')}
                     value={this.state.sEmail}
                     allowCreate={true}
                     source={this.state.directoryEmail}
                     
                   />
                   <Autocomplete 
                     icon='email'
                     direction="down"
                     label="Замена:"
                     hint=""
                     multiple={false}
                     onChange={this.handleChange.bind(this, 'dEmail')}
                     onQueryChange={this.handleChange.bind(this, 'dEmail')}
                     value={this.state.dEmail}
                     allowCreate={true}
                     source={this.state.directoryEmail}
                     />
        
         
         

        </Dialog>
      </div>
    )
  }
}


