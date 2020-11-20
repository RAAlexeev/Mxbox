import SnackbarRT from 'react-toolbox/lib/snackbar'
import React = require('react');
import { observable } from 'mobx';
export class Snackbar extends React.Component {
    handleSnackbarClick = (event, instance) => {
     // console.log('handleSnackbarClick', event, instance);
      this.setState({ active: false });
    };
  
    handleSnackbarTimeout = (event, instance) => {
      //console.log('handleSnackbarClick', event, instance);
      this.setState({ active: false });
    };
  
    handleClick = () => {
      this.setState({ active: true });
    };
  
   @observable state = {
      active: false,
      label: ''
    }
  
    render () {
      return (
        <section>
         
          <SnackbarRT
            action=' ОК'
            active={this.state.active}
            label={this.state.label}
            timeout={5000}
            onClick={this.handleSnackbarClick}
            onTimeout={this.handleSnackbarTimeout}
            type='cancel'
          />
        </section>
      );
    }
  }
  

  