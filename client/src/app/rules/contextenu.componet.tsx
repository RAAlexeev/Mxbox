import * as React from 'react';
import { IconMenu, MenuItem, MenuDivider } from 'react-toolbox/lib/menu';
import * as style from './rules.css';
import Button from 'react-toolbox/lib/button'
import { TemplatesStore } from './templates.store';
import { RulesStore } from './rules.store';
import Tooltip from 'react-toolbox/lib/tooltip';
const TooltipMIconMenu = Tooltip(IconMenu)
const TooltipMenuItem = Tooltip(MenuItem)
export const TemplateMenu = (realyDialog,templatesStore:TemplatesStore,devicesStore,rulesStore:RulesStore)=> <div>     
  <TooltipMIconMenu tooltipHideOnClick={false} tooltipPosition='top' tooltipDelay={0} tooltip='Шаблоны...' theme={style}  icon='receipt'  position='topRight' menuRipple>
    <MenuItem disabled={!(rulesStore.rules.length > 0)}  value='add' icon='archive' caption='Сохранить' onClick={templatesStore.addAsTemplate.bind(templatesStore,devicesStore.selected)} />
    <MenuDivider />
    
    {templatesStore.templates.map((template, index)=> <div key={index} className={style.menuItemHeight} >
      
        <TooltipMenuItem tooltip='Добавить'  className={ style.menuItem } value={ 'template'+ index } icon='unarchive' caption={template.name} onClick={rulesStore.addFromTemplate.bind(rulesStore,devicesStore.selected,template)} />
        
        
        <Button className={ style.clearButton } icon='clear' onClick={
          ()=>{realyDialog.onDelete=templatesStore.delTemplate.bind(templatesStore, template); realyDialog.handleToggle()}
         }/>
        </div>
    )} 
  </TooltipMIconMenu>
 </div>

 
