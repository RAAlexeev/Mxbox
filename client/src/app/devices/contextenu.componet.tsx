import * as React from 'react';
import {IconMenu, MenuItem, MenuDivider } from 'react-toolbox/lib/menu';
import * as style from './devices.css';
import { Input } from 'react-toolbox/lib/input'





export const ContextMenu = (devicesStore,device) =>window.location.pathname.search('views')<0? <div>
  <IconMenu  icon='more_vert' position='topLeft' menuRipple >

   <MenuItem  onClick={devicesStore.delDevice.bind(devicesStore, device)} value='delete' icon='delete' caption='Удалить'  />
 
   </IconMenu>
  
    <Input className={style.name}
        type='text'
        name='name'
        disabled = {!(devicesStore.isEdit && devicesStore.selected === device)}
        error={device.error}
        value={device.name}
        maxLength={25}        
        onChange={devicesStore.nameOnChange.bind(this, device, devicesStore)}
      />
</div>:<div>  
<IconMenu selectable selected={ device.type }  icon='more_vert' position='topLeft' menuRipple >
   <MenuItem theme={style}  onClick={devicesStore.typeOnChenge.bind(devicesStore,device,0)} value={0} icon='tablet' caption='ДНК 4'  />
   <MenuItem theme={style}  onClick={devicesStore.typeOnChenge.bind(devicesStore,device,1)} value={1} icon='tablet' caption='УЗД 11'  />
</IconMenu>
<Input className={style.name}
    type='text'
    name='name'
    disabled = {!(devicesStore.isEdit && devicesStore.selected === device)}
    error={device.error}
    value={device.name}
    maxLength={25}        
    onChange={devicesStore.nameOnChange.bind(this, device, devicesStore)}
  />
</div>
  
