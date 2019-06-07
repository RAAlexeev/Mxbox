import * as React from 'react';
import {IconMenu, MenuItem, MenuDivider } from 'react-toolbox/lib/menu';
import * as style from './acts.css';
import Chip from 'react-toolbox/lib/chip';
import Avatar from 'react-toolbox/lib/avatar';
import Button from 'react-toolbox/lib/button';
import { ActsStore } from './acts.store';


export const Acts = ( actsStore:ActsStore ) =>
   <div>
     
    
     { actsStore.acts.map((act, index )=>         
      { if(act)switch(act.type) {
              case 0:return <Chip key={index} deletable onDeleteClick={actsStore.delAct.bind(this,index)}>
                                <Avatar style={{ backgroundColor: 'deepskyblue' }} icon='sms'  />
                                <Button icon={ act.sms&&act.sms.text?'':'edit menu' } onClick={()=>{ act.index = index; actsStore.dialogs.smsDialog.handleToggle(act, actsStore.updActSms) }}>
                                    { act.sms&&act.sms.text?act.sms.text.trim().slice(0,10):'' }
                                </Button>
                            </Chip>
              case 1:return <Chip key={index} deletable onDeleteClick={actsStore.delAct.bind(this,index)}>
                                <Avatar style={ {backgroundColor: 'deepskyblue'} } icon='email'  />
                                <Button icon={act.email&&act.email.subject?'':'edit menu'} onClick={()=>{ act.index = index; actsStore.dialogs.emailDialog.handleToggle(act, actsStore.updActEmail) }}>
                                    { act.email&&act.email.subject?act.email.subject.trim().slice(0,10):'' }
                                </Button>
          </Chip>                           
              default:
                  break;
          }
        }
    )} 
   
    <IconMenu icon='add' position='topLeft' menuRipple>
        <MenuItem value='sms' icon='sms' caption='SMS'  onClick={actsStore.addAct.bind(this,{type:0})} />
        <MenuItem value='email' icon='email' caption='Email' onClick={actsStore.addAct.bind(this,{type:1})}/>
    </IconMenu>


</div>