const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class State extends Model {}
  State.init({
    key: { type: Sequelize.TEXT },
    info: { type: Sequelize.JSON },
    updated_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  sequelize, timestamps: false, modelName: 'state'
  })

  State.find = (...args) => State.findAll(...args)
  
  State.insert = (...args) => {
    if(Array.isArray(args[0])){
      return State.bulkCreate(...args)
    }
    else{
      return State.create(...args)
    }
  }

  State.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await State.destroy(delConditon, { transaction: t })
      const result = await State.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  State.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await State.findOne(findConditon)
    if(rec){
      return State.update(insRecord, findConditon)
    }
    else{
      return await State.create(insRecord)
    }
  }
  
  State.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await State.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await State.create(insRecord)
    }
  }

  State.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return State.updateAndInsert(...args)
    }
    else{
      return State.update(args[1], args[0])
    }
  }

  State.mergeJson = async (condition, key, vals) => {
    const rec = await State.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return State.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  State.arrayPush = async (condition, key, val) => {
    const rec = await State.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return State.update({[key]: targetArr}, condition)
    }
  }

  State.arrayPull = async (condition, key, val) => {
    const rec = await State.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return State.update({[key]: targetArr}, condition)
    }
  }

  State.remove = (...args) => State.destroy(...args)

  return State
}