const crypto = require('crypto')
const cryptoKey = 'sushi-browser-password-key'

export default {
  encrypt(text) {
    let cipher = crypto.createCipher('aes-256-ctr', cryptoKey)
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  },
  decrypt(text) {
    let decipher = crypto.createDecipher('aes-256-ctr', cryptoKey);
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
  }
}