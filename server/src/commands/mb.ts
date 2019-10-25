import  crc16 from 'modbus-serial/utils/crc16'
import { parseCommand } from './joson';
export const mbCommands =(addr:number, port,data:Buffer)=>{
    if(addr != data.readUInt8(0) ) return
    if(crc16(data.slice(0,-2))!= data.readUInt16LE(data.length - 2)){//crc err
         port.write(data)
         return
    }

    switch(data.readUInt8(2)){
        case 0x70: parseCommand( data.slice(2,-2).toString('cp1251') )
        break
        case 16:  parseCommand( data.slice(2,-2).toString('cp1251') )
        break
        default:
            const err = new Uint8Array([addr,0x80|data.readUInt8(2),1])     
            port.write(Buffer.concat([err,Buffer.from(crc16(err))]))//возращаем ошибку 01 неподдерживаемая функция
    }
}