import Dialog from 'react-toolbox/lib/dialog';
import React = require('react');


export class RealyDialog extends React.Component {
    onDelete
  state = {
    active: false
  };

  handleToggle = () => {
    this.setState({active: !this.state.active});
  }

  actions = [
    { label: "Отмена", onClick: this.handleToggle },
    { label: "Удалить", onClick: ()=>{ if(this.onDelete) this.onDelete(); this.handleToggle()} }
  ];

  render () {
    return (
      <div>
        <Dialog
          actions={this.actions}
          active={this.state.active}
          onEscKeyDown={this.handleToggle}
          onOverlayClick={this.handleToggle}
          title='Действительно хотите удалить?'
        >

        </Dialog>
      </div>
    );
  }
}