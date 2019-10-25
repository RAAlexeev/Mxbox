import cmd  from 'node-cmd'
export function setDO(num:number,value:number|boolean){
    cmd.run('echo "-w='+num+':0 0 0 '+ value +'0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') 
}