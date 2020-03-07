const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class InputHistory extends Model {}
  InputHistory.init({
    value: { type: Sequelize.TEXT },
    frameUrl: { type: Sequelize.TEXT },
    host: { type: Sequelize.TEXT },
    now: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_INP_HOST', fields: ['host']},
    ],
  sequelize, timestamps: false, modelName: 'inputHistory'
  })

  InputHistory.find = (...args) => InputHistory.findAll(...args)
  
  InputHistory.insert = (...args) => {
    if(Array.isArray(args[0])){
      return InputHistory.bulkCreate(...args)
    }
    else{
      return InputHistory.create(...args)
    }
  }

  InputHistory.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await InputHistory.destroy(delConditon, { transaction: t })
      const result = await InputHistory.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  InputHistory.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await InputHistory.findOne(findConditon)
    if(rec){
      return InputHistory.update(insRecord, findConditon)
    }
    else{
      return await InputHistory.create(insRecord)
    }
  }
  
  InputHistory.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await InputHistory.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await InputHistory.create(insRecord)
    }
  }

  InputHistory.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return InputHistory.updateAndInsert(...args)
    }
    else{
      return InputHistory.update(args[1], args[0])
    }
  }

  InputHistory.mergeJson = async (condition, key, vals) => {
    const rec = await InputHistory.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return InputHistory.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  InputHistory.arrayPush = async (condition, key, val) => {
    const rec = await InputHistory.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return InputHistory.update({[key]: targetArr}, condition)
    }
  }

  InputHistory.arrayPull = async (condition, key, val) => {
    const rec = await InputHistory.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return InputHistory.update({[key]: targetArr}, condition)
    }
  }

  InputHistory.remove = (...args) => InputHistory.destroy(...args)

  return InputHistory
}