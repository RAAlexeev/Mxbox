//https://www.npmjs.com/package/smtp-client
import {SMTPClient} from 'smtp-client';
import { db_settings, db, Email,Device } from '../../schema';
 

export  function sendMail(device:Device, email:Email, ruleIndex){
(async function() {
    db_settings.loadDatabase()
    await db_settings.findOne({_id:'smtp'}, async function(err,smtpConf:any){
    let s= new SMTPClient({
      secure:true,  
      host: smtpConf.address,
      port: smtpConf.port
    });
    if(err) return err;
    await s.connect();
    await s.greet({hostname: smtpConf.address}); // runs EHLO command or HELO as a fallback
    await s.authPlain({username: smtpConf.name, password: smtpConf.password}); // authenticates a user
    await s.mail( {from: smtpConf.from} ); // runs MAIL FROM command
    await s.rcpt( {to: email.address} ); // runs RCPT TO command (run this multiple times to add more recii)
    await s.data( 'From:' + device.name + '#'+ ruleIndex +'\r\nSubject:'+ email.subject +'\r\n'+ email.body ); // runs DATA command and streams email source
    await s.quit(); // runs QUIT command
  })

})().catch(console.error);
 }