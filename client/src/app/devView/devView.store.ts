import { observable, action, runInAction, computed } from 'mobx'
import gql from 'graphql-tag'
import { AppStore } from '../app.store'
import { DevicesStore } from '../devices/devices.store';





export class DevViewStore {

  appStore: AppStore

 // deviceSubscription

@observable data:{
  timestamp:Date
  err:string
  emCircle:{on:string,blockPump:string, cnt:number}
  pumps:{
    work:boolean
    manual:boolean
    em:boolean
    sensor:{insulation:boolean,humidity:string, temp:string, em:boolean}
    narabotka:number
    startCnt:number
  }[]
  tank:{
    dlvl:number
    alvl:number
    em:boolean
    sensors:{
      em:boolean
      use:boolean

      }
    }
  }
  deviceSubscription: ZenObservable.Subscription;
  constructor(){
      let self = this
      
      this.appStore = AppStore.getInstance()

      //this.appStore.appComponent.timestamp = new Date(0)

        this.deviceSubscription = this.appStore.apolloClient.subscribe({
        query: gql`subscription onDNK4upd($id:ID!){
                updDNK4ViewData(id:$id){
                  _id,
                 buffer
                }
              }`,
        variables: {id:DevicesStore.getInstance().selected._id }
      }).subscribe({
        next:(value)=> {

      ///   console.log(this.data)
          if(!value.data) return;
          if(!this.appStore.appComponent.timestamp)this.appStore.appComponent.timestamp=new Date()
          this.appStore.appComponent.timestamp.setTime(Date.now())
          let buf = Buffer.from(value.data)
          const reg9=buf.readUInt16BE(0)
          switch (reg9){
            case 0: this.data.err = 'норма'
            break
            case 1: this.data.err = 'работа насосов заблокирована'
            break
            case 2: this.data.err = 'аварийный цикл'
            break
            case 3: this.data.err = 'неисправность дискретных датчиков бака'
            break
            case 4: this.data.err = 'обрыв аналогового датчиков бака'
            break
            case 5: this.data.err = 'замыкание аналогового датчиков бака'
            break
            case 6: this.data.err = 'переполнение бака'
            break
            case 7: this.data.err = 'авария сети по напряжению'
            break
            case 8: this.data.err = ' неверная последовательность фаз'
            break
            case 10:
            case 20:
            case 30: 
            case 40:
                this.data.err = `Насос${reg9/10} отказ пускателя`
            break   
            case 11:
            case 21:
            case 31: 
            case 41:
                  this.data.err = `Насос${reg9/10} сухой ход`
            break 
            case 12:
            case 22:
            case 32: 
            case 42:
                  this.data.err = `Насос${reg9/10} перегрев`
            break  
            case 13:
            case 23:
            case 33: 
            case 43:
                  this.data.err = `Насос${reg9/10} замыкание ДТ`
            break
            case 14:
            case 24:
            case 34: 
            case 44:
                 this.data.err = `Насос${reg9/10} обрыв ДТ`
            break
            case 15:
            case 25:
            case 35: 
            case 45:
                  this.data.err = `Насос${reg9/10} вода`
            break
            case 16:
            case 26:
            case 36: 
            case 46:
                  this.data.err = `Насос${reg9/10} обрыв Двл`
            break 
            case 17:
            case 27:
            case 37: 
            case 47:
                  this.data.err = `Насос${reg9/10} низкое сопротивление изоляции`
            break
            case 18:
            case 28:
            case 38: 
            case 48:
                  this.data.err = `Насос${reg9/10} задержка обслуживания`
            break
            case 19:
            case 29:
            case 39: 
            case 49:
                  this.data.err = `Насос${reg9/10}  авария двигателя (внешняя авария)`
            break                                                 
          }
          if(buf.readUInt16BE(1)) this.data.emCircle.on = 'Аварийный цикл'; else this.data.emCircle.on = ''
          if(buf.readUInt16BE(2)) this.data.emCircle.blockPump = 'Блокировка насосов по окончании аварийного цикла'; else this.data.emCircle.blockPump = ''
          this.data.emCircle.cnt =  buf.readUInt16BE(3)
          for(let num = 0; num < 4; num++ ){
            this.data.pumps[num].work = ((buf.readUInt16BE(4)&(1<<num)) != 0)
            this.data.pumps[num].manual =((buf.readUInt16BE(5)&(1<<num)) != 0)
            this.data.pumps[num].em =  ((buf.readUInt16BE(6)&(1<<num)) != 0)
            this.data.pumps[num].sensor.insulation = ((buf.readUInt16BE(num+7) & 1 ) === 1)
           switch( buf.readUInt16BE(num+7) & 0b00000110 >> 1 ){
              case 0: this.data.pumps[num].sensor.humidity = 'масло'
              break
              case 1: this.data.pumps[num].sensor.humidity = 'вода'
              break
              case 2: this.data.pumps[num].sensor.humidity = 'обрыв'
              break
            }
            switch( buf.readUInt16BE(num+7) & 0b00011000 >> 3 ){
              case 0: this.data.pumps[num].sensor.temp = 'норма'
              break
              case 1: this.data.pumps[num].sensor.temp = 'перегрев'
              break
              case 2: this.data.pumps[num].sensor.temp = 'обрыв'
              break
              case 2: this.data.pumps[num].sensor.temp = 'замыкание'
              break
              }
              this.data.pumps[num].narabotka = buf.readUInt16BE(10+num) 
              this.data.pumps[num].startCnt = buf.readUInt16BE(14+num) 
              //18
              //18+8=24
              
              
          }
          this.data.tank.dlvl = buf.readUInt16BE(24)&0b0000000000000111
          this.data.tank.em = (buf.readUInt16BE(24)&0b0000000000000100) != 0
          this.data.tank.alvl = buf.readUInt16BE(25)
        },
        error:(err)=> { console.error(err)
        },
      }) 
  } 

  destructor() {
    this.deviceSubscription.unsubscribe()
    delete this.appStore.appComponent.timestamp
  }



  

}



