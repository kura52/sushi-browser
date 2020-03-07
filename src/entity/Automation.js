const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class Automation extends Model {}
  Automation.init({
    key: { type: Sequelize.TEXT },
    ops: { type: Sequelize.JSON },
    updated_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_AUT_KEY', fields: ['key']},
    ],
  sequelize, timestamps: false, modelName: 'automation'
  })

  Automation.find = (...args) => Automation.findAll(...args)
  
  Automation.insert = (...args) => {
    if(Array.isArray(args[0])){
      return Automation.bulkCreate(...args)
    }
    else{
      return Automation.create(...args)
    }
  }

  Automation.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await Automation.destroy(delConditon, { transaction: t })
      const result = await Automation.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  Automation.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await Automation.findOne(findConditon)
    if(rec){
      return Automation.update(insRecord, findConditon)
    }
    else{
      return await Automation.create(insRecord)
    }
  }
  
  Automation.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await Automation.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await Automation.create(insRecord)
    }
  }

  Automation.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return Automation.updateAndInsert(...args)
    }
    else{
      return Automation.update(args[1], args[0])
    }
  }

  Automation.mergeJson = async (condition, key, vals) => {
    const rec = await Automation.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return Automation.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  Automation.arrayPush = async (condition, key, val) => {
    const rec = await Automation.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return Automation.update({[key]: targetArr}, condition)
    }
  }

  Automation.arrayPull = async (condition, key, val) => {
    const rec = await Automation.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return Automation.update({[key]: targetArr}, condition)
    }
  }

  Automation.remove = (...args) => Automation.destroy(...args)

  return Automation
}