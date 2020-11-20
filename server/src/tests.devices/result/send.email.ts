//https://www.npmjs.com/package/smtp-client
import {SMTPClient} from 'smtp-client';
import { db_settings, Email,Device, pubsub, ERROR_MESSAGES } from '../../schema';

 

export  function sendMail(email:Email, device?:Device, ruleIndex?){

    db_settings.loadDatabase()
     db_settings.findOne({_id:'smtp'}, async function(err,smtpConf:any){
      console.dir(email)
      if(err && !smtpConf){ 
        console.error(err)
        pubsub.publish(ERROR_MESSAGES, { deviceLinkState:{ message:'Send email: '+ err.message }  });  

      }
    let s= new SMTPClient({
      secure:true,  
      host: smtpConf.address,
      port: smtpConf.port
    });
    const address =  email.address.split(',')
    try{
      await s.connect();
      await s.greet({hostname: 'mxBox', timeout:0 }); // runs EHLO command or HELO as a fallback
      await s.authPlain({username: smtpConf.name, password: smtpConf.password}); // authenticates a user
      await s.mail( {from: smtpConf.name} ); // runs MAIL FROM command
      for(let i = 0; i < address.length;i++){
        await s.rcpt( {to: address[i].trim()} );
      } // runs RCPT TO command (run this multiple times to add more recii)
      await s.data(`From: ${device?'('+device.name:''}${ruleIndex?'#'+ruleIndex+')':''+smtpConf.name}\r\nTo:${email.address}\r\nSubject:${email.subject}\r\nContent-Type:text/plain;charset=utf-8\r\n\r\n${email.body}`); // runs DATA command and streams email source
      await s.quit(); // runs QUIT command      pubsub.publish(ERROR_MESSAGES, { deviceLinkState:{ message:'Send email: '+ e.message }  });  
      pubsub.publish(ERROR_MESSAGES, {errorMessages:{  message:"Отправлено:"+email.subject } });  

    }catch(e){
      console.error(e)               
      pubsub.publish(ERROR_MESSAGES,  {errorMessages:{ message:'Send email: '+ e.message } } );  
    }finally{
      
    }

  })


 }