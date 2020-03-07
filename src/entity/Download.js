const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class Download extends Model {}
  Download.init({
    state: { type: Sequelize.TEXT },
    savePath: { type: Sequelize.TEXT },
    filename: { type: Sequelize.TEXT },
    url: { type: Sequelize.TEXT },
    referer: { type: Sequelize.TEXT },
    totalBytes: { type: Sequelize.INTEGER },
    now: { type: Sequelize.INTEGER },
    created_at: { type: Sequelize.INTEGER },
    updated_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  sequelize, timestamps: false, modelName: 'download'
  })

  Download.find = (...args) => Download.findAll(...args)
  
  Download.insert = (...args) => {
    if(Array.isArray(args[0])){
      return Download.bulkCreate(...args)
    }
    else{
      return Download.create(...args)
    }
  }

  Download.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await Download.destroy(delConditon, { transaction: t })
      const result = await Download.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  Download.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await Download.findOne(findConditon)
    if(rec){
      return Download.update(insRecord, findConditon)
    }
    else{
      return await Download.create(insRecord)
    }
  }
  
  Download.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await Download.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await Download.create(insRecord)
    }
  }

  Download.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return Download.updateAndInsert(...args)
    }
    else{
      return Download.update(args[1], args[0])
    }
  }

  Download.mergeJson = async (condition, key, vals) => {
    const rec = await Download.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return Download.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  Download.arrayPush = async (condition, key, val) => {
    const rec = await Download.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return Download.update({[key]: targetArr}, condition)
    }
  }

  Download.arrayPull = async (condition, key, val) => {
    const rec = await Download.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return Download.update({[key]: targetArr}, condition)
    }
  }

  Download.remove = (...args) => Download.destroy(...args)

  return Download
}