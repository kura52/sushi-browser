const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class Downloader extends Model {}
  Downloader.init({
    key: { type: Sequelize.TEXT },
    idForExtension: { type: Sequelize.INTEGER },
    isPaused: { type: Sequelize.BOOLEAN },
    url: { type: Sequelize.TEXT },
    orgUrl: { type: Sequelize.TEXT },
    referer: { type: Sequelize.TEXT },
    requestHeaders: { type: Sequelize.JSON },
    filename: { type: Sequelize.TEXT },
    receivedBytes: { type: Sequelize.INTEGER },
    totalBytes: { type: Sequelize.INTEGER },
    state: { type: Sequelize.TEXT },
    speed: { type: Sequelize.TEXT },
    est_end: { type: Sequelize.INTEGER },
    savePath: { type: Sequelize.TEXT },
    mimeType: { type: Sequelize.TEXT },
    created_at: { type: Sequelize.INTEGER },
    ended: { type: Sequelize.INTEGER },
    now: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_DOW_KEY', fields: ['key']},
    ],
  sequelize, timestamps: false, modelName: 'downloader'
  })

  Downloader.find = (...args) => Downloader.findAll(...args)
  
  Downloader.insert = (...args) => {
    if(Array.isArray(args[0])){
      return Downloader.bulkCreate(...args)
    }
    else{
      return Downloader.create(...args)
    }
  }

  Downloader.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await Downloader.destroy(delConditon, { transaction: t })
      const result = await Downloader.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  Downloader.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await Downloader.findOne(findConditon)
    if(rec){
      return Downloader.update(insRecord, findConditon)
    }
    else{
      return await Downloader.create(insRecord)
    }
  }
  
  Downloader.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await Downloader.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await Downloader.create(insRecord)
    }
  }

  Downloader.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return Downloader.updateAndInsert(...args)
    }
    else{
      return Downloader.update(args[1], args[0])
    }
  }

  Downloader.mergeJson = async (condition, key, vals) => {
    const rec = await Downloader.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return Downloader.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  Downloader.arrayPush = async (condition, key, val) => {
    const rec = await Downloader.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return Downloader.update({[key]: targetArr}, condition)
    }
  }

  Downloader.arrayPull = async (condition, key, val) => {
    const rec = await Downloader.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return Downloader.update({[key]: targetArr}, condition)
    }
  }

  Downloader.remove = (...args) => Downloader.destroy(...args)

  return Downloader
}