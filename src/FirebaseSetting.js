import firebase from 'firebase'
import {token} from './databaseFork'
const crypto = require('crypto')
const uuid = require('node-uuid')

// require('locus')

const config = {
  apiKey: "AIzaSyCZFJ_UVwezRCWS3IMfGusPMZqmZsN6zdE",
  authDomain: "browser-b2ecd.firebaseapp.com",
  databaseURL: "https://browser-b2ecd.firebaseio.com",
  projectId: "browser-b2ecd",
  storageBucket: "browser-b2ecd.appspot.com",
  messagingSenderId: "427711452647"
}

let instance
firebase.initializeApp(config)

let cryptoKey
const passCrypto = {
  encrypt(text){
    let cipher = crypto.createCipher('aes-256-ctr', cryptoKey)
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  },
  decrypt(text){
    let decipher = crypto.createDecipher('aes-256-ctr',cryptoKey);
    let dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  }
}

class FirebaseSetting{
  constructor(credntial) {
    console.log(credntial)
    if(credntial){
      return this.authSyncPage(credntial)
    }
    else{
      return this.authLocal()
    }
  }

  async authSyncPage(credential){
    // eval(locus)
    const loginCredential = firebase.auth.GoogleAuthProvider.credential(credential.idToken)
    const authRet = await this.credential(loginCredential,{idToken:credential.idToken})
    if(!authRet) return authRet
    return instance
  }

  async authLocal(){
    const tokens = await token.find({ email: { $exists: true } })
    console.log(56,tokens)
    if(!tokens) return false

    let success
    for(let t of tokens){
      const email = t.email
      cryptoKey = email
      const password = passCrypto.decrypt(t.password)
      try{
        const result = await firebase.auth().signInWithEmailAndPassword(email, password)
        this.name = result.displayName
        this.email = result.email
        this.uid = result.uid
        this.password = password
        success = true
        break
      }catch(e){
        console.log(e)
      }
    }
    if(!success) return false

    this.database = firebase.database()
    // this.storage = firebase.storage()
    instance = this
    return instance
  }

  async credential(loginCredential,{idToken}) {
    try{
      const result = await firebase.auth().signInWithCredential(loginCredential)
      // eval(locus)
      this.name = result.displayName
      this.email = result.email
      this.uid = result.uid
      console.log(this.name,this.email)
    }catch(e){
      console.log(e)
      return false
    }
    this.database = firebase.database()

    try{
      const data = await this.database.ref(`users/${this.uid}`).once('value')
      const password = data.val().password
      if(password){
        cryptoKey = this.email
        this.password = passCrypto.decrypt(password)

        token.update({email:this.email},{email:this.email,uid:this.uid,password:password, updated_at: Date.now()}, { upsert: true }).then(_=>_)
        instance = this
        return true
      }
    }catch(e){
      console.log(e)
    }


    const password = uuid.v4().replace(/\-/g,'')
    cryptoKey = this.email
    try{
      const user = firebase.auth().currentUser;
      await user.updatePassword(password)
    }catch(e){
      console.log(e)
    }
    const cPassword = passCrypto.encrypt(password)
    this.database.ref(`users/${this.uid}`).set({
      name: this.name,
      email: this.email,
      password: cPassword
    });
    this.password = password
    token.update({email:this.email},{email:this.email,uid:this.uid,password:cPassword, updated_at: Date.now()}, { upsert: true }).then(_=>_)

    // this.storage = firebase.storage()

    instance = this
    return true
  }

}


export default function(initData){
  if(!instance){
    return new FirebaseSetting(initData)
  }
  else{
    return new Promise((resolve)=>resolve(instance))
  }
}