import cmd  from 'node-cmd'

 var _APN

export function getAPN()
{
    if(_APN){
      console.log(_APN)
      return _APN
    }

    else
    cmd.get('content query --uri content://telephony/carriers/preferapn',(err, data:string, stderr)=>{
        if (!err ) {
            try{
            _APN = JSON.parse(
                  '{'+data.substring(7)
                      .replace(/(\S+)=/g,'"$1":')
                      .replace(/:(0(?!,)|\D(?!ULL))/g,':"$1')
                      .replace(/=/g,':')
                      .replace(/:"(\S*),/g,':"$1",')
                      .replace(/NULL/g,'null').slice(0,-1)
                    +'"}')
             console.log(_APN)
             return _APN
           }catch(err){
            console.error(err)
           }
          
        }else  console.error("getAPN():",err)
        return {}
    })
}
var tOut;
export const setAPN=(APN)=>{

  _APN={..._APN,APN} 
  clearTimeout(tOut)
  tOut = setTimeout(
    ()=>  {
        const isString = str => ((typeof str === 'string') || (str instanceof String));
          APN={...APN,[Symbol.iterator] : function* () {
            var k;
            for ( k in this ) {
                yield {key:k, value:this[k]};
            }
        }}
        let sql = `echo "UPDATE carriers SET `
        var k; 
        for( k in APN){
            sql += k + `=${isString(APN[k])?"'":''}${APN[k]}${isString(APN[k])?"'":''},`;
        }
        sql=sql.slice(0,-1) + ` WHERE _id = `+_APN._id+';"|'
      
        cmd.get(sql+'sqlite3 /data/data/com.android.providers.telephony/databases/telephony.db',
          (err, data, stderr)=>{
            console.log(err,data)
          })
    },2000)  
  //    let db = new sqlite3.Database('/data/data/com.android.providers.telephony/databases/telephony.db');
   //   db.run(sql,data)
  //   db.close()
}