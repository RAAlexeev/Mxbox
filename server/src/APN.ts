import cmd  from 'node-cmd'
export  var _APN

export function getAPN()
{
    if(_APN)return _APN
    else
    cmd.get('content query --uri content://telephony/carriers/preferapn',(err, data:string, stderr)=>{
        if (!err) {
            console.log(data)
           return _APN = JSON.parse(
         '{'+data.substring(7)
            .replace(/(\S+)=/g,'"$1":')
            .replace(/:(0|\D(?!ULL)|(?!,))/g,':"$1')
            .replace(/=/g,':')
            .replace(/:"(\S*),/g,':"$1",')
            .replace(/NULL/g,'null').slice(0,-1)
          +'"}')
        }
    })
}

export const setAPN=(APN)=>{
     const isString = str => ((typeof str === 'string') || (str instanceof String));
      APN={...APN,[Symbol.iterator] : function* () {
        var k;
        for ( k in this ) {
            yield {key:k, value:this[k]};
        }
    }}
    let sql = `UPDATE carriers `
    var k; 
    for( k in APN){
        sql += k + `=${isString(APN[k])?'"':''}${APN[k]}${isString(APN[k])?'"':''},`;
    }
    sql=sql.slice(0,-1) + ` WHERE _id = `+_APN._id
           
 cmd.run('sqlite3 /data/data/com.android.providers.telephony/databases/telephony.db '+ sql)
      
  //    let db = new sqlite3.Database('/data/data/com.android.providers.telephony/databases/telephony.db');
   //   db.run(sql,data)
  //   db.close()
}