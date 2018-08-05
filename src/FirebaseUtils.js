import firebase from 'firebase'
import {token} from './databaseFork'
import {ipcMain} from "electron";
const crypto = require('crypto')
const uuid = require('node-uuid')
const mainState = require('./mainState')

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

class firebaseUtils{

  async regist(email,password){
    try{
      const user = await firebase.auth().createUserWithEmailAndPassword(email, password)
      console.log(user)
      const uid = user.uid

      cryptoKey = email
      password = passCrypto.encrypt(password)

      token.update({email},{email:email,uid,password,login:true, updated_at: Date.now()}, { upsert: true }).then(_=>_)
      mainState.emailSync = email
      ipcMain.emit('start-sync',null,true)
      return false
    }catch(error){
      console.log(error,error.message)
      return error.message
    }
  }

  async login(email,password){
    try{
      const user = await firebase.auth().signInWithEmailAndPassword(email, password)
      console.log(user)
      const uid = user.uid

      cryptoKey = email
      password = passCrypto.encrypt(password)

      token.update({email},{email:email,uid,password,login:true, updated_at: Date.now()}, { upsert: true }).then(_=>_)
      mainState.emailSync = email
      ipcMain.emit('start-sync',null,true)
      return false
    }catch(error){
      console.log(error,error.message)
      return error.message
    }
  }


  async logout(email){
    try{
      await firebase.auth().signOut()

      token.update({email},{$set: {login:false, updated_at: Date.now()}}).then(_=>_)
      delete mainState.emailSync
      ipcMain.emit('start-sync',null,false)
      return false
    }catch(error){
      console.log(error,error.message)
      return error.message
    }
  }

  async checkAndLogin(){
    const tokenData = await token.findOne({login: true})
    if(tokenData){
      try{
        await this.login(tokenData.email, this.decryptPassword(tokenData.email,tokenData.password))
        return tokenData.email
      }catch(e){
        consol.elog(e)
        token.update({email: tokenData.email},{$set: {login:false, updated_at: Date.now()}}).then(_=>_)
        delete mainState.emailSync
      }
    }
    return false
  }

  decryptPassword(email,password){
    cryptoKey = email
    return passCrypto.decrypt(password)
  }
}


export default new firebaseUtils()