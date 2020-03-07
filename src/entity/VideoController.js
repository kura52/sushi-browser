const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class VideoController extends Model {}
  VideoController.init({
    url: { type: Sequelize.TEXT },
    values: { type: Sequelize.JSON },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_VID_URL', fields: ['url']},
    ],
  sequelize, timestamps: false, modelName: 'videoController'
  })

  VideoController.find = (...args) => VideoController.findAll(...args)
  
  VideoController.insert = (...args) => {
    if(Array.isArray(args[0])){
      return VideoController.bulkCreate(...args)
    }
    else{
      return VideoController.create(...args)
    }
  }

  VideoController.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await VideoController.destroy(delConditon, { transaction: t })
      const result = await VideoController.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  VideoController.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await VideoController.findOne(findConditon)
    if(rec){
      return VideoController.update(insRecord, findConditon)
    }
    else{
      return await VideoController.create(insRecord)
    }
  }
  
  VideoController.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await VideoController.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await VideoController.create(insRecord)
    }
  }

  VideoController.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return VideoController.updateAndInsert(...args)
    }
    else{
      return VideoController.update(args[1], args[0])
    }
  }

  VideoController.mergeJson = async (condition, key, vals) => {
    const rec = await VideoController.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return VideoController.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  VideoController.arrayPush = async (condition, key, val) => {
    const rec = await VideoController.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return VideoController.update({[key]: targetArr}, condition)
    }
  }

  VideoController.arrayPull = async (condition, key, val) => {
    const rec = await VideoController.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return VideoController.update({[key]: targetArr}, condition)
    }
  }

  VideoController.remove = (...args) => VideoController.destroy(...args)

  return VideoController
}