const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class AutomationOrder extends Model {}
  AutomationOrder.init({
    key: { type: Sequelize.TEXT },
    datas: { type: Sequelize.JSON },
    menuKey: { type: Sequelize.TEXT },
    updated_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  sequelize, timestamps: false, modelName: 'automationOrder'
  })

  AutomationOrder.find = (...args) => AutomationOrder.findAll(...args)
  
  AutomationOrder.insert = (...args) => {
    if(Array.isArray(args[0])){
      return AutomationOrder.bulkCreate(...args)
    }
    else{
      return AutomationOrder.create(...args)
    }
  }

  AutomationOrder.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await AutomationOrder.destroy(delConditon, { transaction: t })
      const result = await AutomationOrder.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  AutomationOrder.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await AutomationOrder.findOne(findConditon)
    if(rec){
      return AutomationOrder.update(insRecord, findConditon)
    }
    else{
      return await AutomationOrder.create(insRecord)
    }
  }
  
  AutomationOrder.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await AutomationOrder.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await AutomationOrder.create(insRecord)
    }
  }

  AutomationOrder.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return AutomationOrder.updateAndInsert(...args)
    }
    else{
      return AutomationOrder.update(args[1], args[0])
    }
  }

  AutomationOrder.mergeJson = async (condition, key, vals) => {
    const rec = await AutomationOrder.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return AutomationOrder.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  AutomationOrder.arrayPush = async (condition, key, val) => {
    const rec = await AutomationOrder.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return AutomationOrder.update({[key]: targetArr}, condition)
    }
  }

  AutomationOrder.arrayPull = async (condition, key, val) => {
    const rec = await AutomationOrder.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return AutomationOrder.update({[key]: targetArr}, condition)
    }
  }

  AutomationOrder.remove = (...args) => AutomationOrder.destroy(...args)

  return AutomationOrder
}