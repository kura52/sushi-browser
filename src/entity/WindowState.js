const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class WindowState extends Model {}
  WindowState.init({
    key: { type: Sequelize.TEXT },
    id: { type: Sequelize.TEXT },
    updated_at: { type: Sequelize.INTEGER },
    close: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_WIN_KEY', fields: ['key']},
    ],
  sequelize, timestamps: false, modelName: 'windowState'
  })

  WindowState.find = (...args) => WindowState.findAll(...args)
  
  WindowState.insert = (...args) => {
    if(Array.isArray(args[0])){
      return WindowState.bulkCreate(...args)
    }
    else{
      return WindowState.create(...args)
    }
  }

  WindowState.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await WindowState.destroy(delConditon, { transaction: t })
      const result = await WindowState.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  WindowState.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await WindowState.findOne(findConditon)
    if(rec){
      return WindowState.update(insRecord, findConditon)
    }
    else{
      return await WindowState.create(insRecord)
    }
  }
  
  WindowState.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await WindowState.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await WindowState.create(insRecord)
    }
  }

  WindowState.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return WindowState.updateAndInsert(...args)
    }
    else{
      return WindowState.update(args[1], args[0])
    }
  }

  WindowState.mergeJson = async (condition, key, vals) => {
    const rec = await WindowState.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return WindowState.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  WindowState.arrayPush = async (condition, key, val) => {
    const rec = await WindowState.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return WindowState.update({[key]: targetArr}, condition)
    }
  }

  WindowState.arrayPull = async (condition, key, val) => {
    const rec = await WindowState.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return WindowState.update({[key]: targetArr}, condition)
    }
  }

  WindowState.remove = (...args) => WindowState.destroy(...args)

  return WindowState
}