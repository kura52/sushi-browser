const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class History extends Model {}
  History.init({
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    location: { type: Sequelize.TEXT },
    title: { type: Sequelize.TEXT },
    created_at: { type: Sequelize.INTEGER },
    updated_at: { type: Sequelize.INTEGER },
    count: { type: Sequelize.INTEGER },
    favicon: { type: Sequelize.TEXT },
    capture: { type: Sequelize.TEXT },
    pin: { type: Sequelize.INTEGER }
  },
  {
  indexes: [
      { name: 'I_HIS_LOCATION', fields: ['location']}, 
      { name: 'I_HIS_TITLE', fields: ['title']}, 
      { name: 'I_HIS_UPDATED_AT', fields: ['updated_at']}, 
      { name: 'I_HIS_COUNT', fields: ['count']},
    ],
  sequelize, timestamps: false, modelName: 'history'
  })

  History.find = (...args) => History.findAll(...args)
  
  History.insert = (...args) => {
    if(Array.isArray(args[0])){
      return History.bulkCreate(...args)
    }
    else{
      return History.create(...args)
    }
  }

  History.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await History.destroy(delConditon, { transaction: t })
      const result = await History.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  History.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await History.findOne(findConditon)
    if(rec){
      return History.update(insRecord, findConditon)
    }
    else{
      return await History.create(insRecord)
    }
  }
  
  History.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await History.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await History.create(insRecord)
    }
  }

  History.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return History.updateAndInsert(...args)
    }
    else{
      return History.update(args[1], args[0])
    }
  }

  History.mergeJson = async (condition, key, vals) => {
    const rec = await History.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return History.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  History.arrayPush = async (condition, key, val) => {
    const rec = await History.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return History.update({[key]: targetArr}, condition)
    }
  }

  History.arrayPull = async (condition, key, val) => {
    const rec = await History.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return History.update({[key]: targetArr}, condition)
    }
  }

  History.remove = (...args) => History.destroy(...args)

  return History
}