const crypto = require('crypto')
const key = Buffer.from('DD40F61878B23CFF441652518DB6BF7F11C6AC997CEEBDEFABFEC02A9F532CAF','hex')
const iv = Buffer.from('03E5254B8166E4BA1E27B07FE831064F', 'hex')
console.log(key,'/',iv)
//const ungzip = zlib.createGunzip();
const decipher = crypto.createDecipheriv('aes-256-cbc' ,key,  iv);