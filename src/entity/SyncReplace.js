const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class SyncReplace extends Model {}
  SyncReplace.init({
    key: { type: Sequelize.TEXT },
    val: { type: Sequelize.TEXT },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  sequelize, timestamps: false, modelName: 'syncReplace'
  })

  SyncReplace.find = (...args) => SyncReplace.findAll(...args)
  
  SyncReplace.insert = (...args) => {
    if(Array.isArray(args[0])){
      return SyncReplace.bulkCreate(...args)
    }
    else{
      return SyncReplace.create(...args)
    }
  }

  SyncReplace.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await SyncReplace.destroy(delConditon, { transaction: t })
      const result = await SyncReplace.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  SyncReplace.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await SyncReplace.findOne(findConditon)
    if(rec){
      return SyncReplace.update(insRecord, findConditon)
    }
    else{
      return await SyncReplace.create(insRecord)
    }
  }
  
  SyncReplace.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await SyncReplace.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await SyncReplace.create(insRecord)
    }
  }

  SyncReplace.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return SyncReplace.updateAndInsert(...args)
    }
    else{
      return SyncReplace.update(args[1], args[0])
    }
  }

  SyncReplace.mergeJson = async (condition, key, vals) => {
    const rec = await SyncReplace.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return SyncReplace.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  SyncReplace.arrayPush = async (condition, key, val) => {
    const rec = await SyncReplace.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return SyncReplace.update({[key]: targetArr}, condition)
    }
  }

  SyncReplace.arrayPull = async (condition, key, val) => {
    const rec = await SyncReplace.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return SyncReplace.update({[key]: targetArr}, condition)
    }
  }

  SyncReplace.remove = (...args) => SyncReplace.destroy(...args)

  return SyncReplace
}