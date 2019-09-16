import * as React from 'react';
import {IconMenu, MenuItem, MenuDivider } from 'react-toolbox/lib/menu';
import * as style from './devices.css';
import Chip from 'react-toolbox/lib/chip';
import Avatar from 'react-toolbox/lib/avatar';
import{TrigsStore} from './trigs.store'
import Button from 'react-toolbox/lib/button';
import Tooltip from 'react-toolbox/lib/tooltip';
const TooltipButton = Tooltip(Button)
export const Trigs = ( trigStore:TrigsStore ) =>
   <div>
     
    
     { trigStore.trigs.map(( trig, index )=>         
      { if(trig)switch(trig.type) {
              case 0:return <Chip key={index} deletable onDeleteClick={trigStore.delTrig.bind(this,index)}>
                                <Avatar style={{backgroundColor: 'deepskyblue'}} icon='code'  />
                                <TooltipButton tooltip={trig.coment?trig.coment:'Изменить'} icon={trig.condition?'':'edit menu'} onClick={()=>trigStore.dialogs.codeDialog.handleToggle(trig, trigStore) }>
                                    {trig.condition?trig.condition.trim().slice(0,10):''}
                                </TooltipButton>
                            </Chip>
             case 1:return <Chip key={index} deletable onDeleteClick={trigStore.delTrig.bind(this,index)}>
                                <Avatar style={{backgroundColor: 'deepskyblue'}} icon='alarm'  />
                                <TooltipButton tooltip={trig.coment?trig.coment:'Изменить'} icon={trig.cron?null:'edit menu'} onClick={()=>trigStore.dialogs.cronDialog.handleToggle(trig, trigStore.updTrig) }>
                                    {trig.cron?trig.cron.trim().slice(0,10):null}
                                </TooltipButton>
                            </Chip>

             case 2:return <Chip key={index} deletable onDeleteClick={trigStore.delTrig.bind(this,index)}>
                   <Avatar style={{backgroundColor: 'deepskyblue'}} icon='sms'  />
                    <TooltipButton tooltip={trig.coment?trig.coment:'Изменить'} icon={trig.cron?null:'edit menu'} onClick={()=>trigStore.dialogs.smsDialog.handleToggle(trig, trigStore.updTrig) }>
                    {trig.cron?trig.cron.trim().slice(0,10):null}
                    </TooltipButton>
                </Chip>            
              default:
                  break;
          }
        }
    )} 
   
    <IconMenu icon='add' position='topLeft' menuRipple>
        <MenuItem value='condition' icon='code' caption='Условие'  onClick={trigStore.addTrig.bind(trigStore,{type:0})} />
        <MenuItem value='cron' icon='alarm' caption='Расписание'  onClick={trigStore.addTrig.bind(trigStore,{type:1})} />
        <MenuItem value='in_sms' icon='sms' caption='sms' onClick={trigStore.addTrig.bind(trigStore,{type:2})} />
      
    </IconMenu>


</div>