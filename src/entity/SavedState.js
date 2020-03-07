const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class SavedState extends Model {}
  SavedState.init({
    wins: { type: Sequelize.JSON },
    created_at: { type: Sequelize.INTEGER },
    user: { type: Sequelize.BOOLEAN },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_SAV_CREATED_AT', fields: ['created_at']},
    ],
  sequelize, timestamps: false, modelName: 'savedState'
  })

  SavedState.find = (...args) => SavedState.findAll(...args)
  
  SavedState.insert = (...args) => {
    if(Array.isArray(args[0])){
      return SavedState.bulkCreate(...args)
    }
    else{
      return SavedState.create(...args)
    }
  }

  SavedState.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await SavedState.destroy(delConditon, { transaction: t })
      const result = await SavedState.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  SavedState.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await SavedState.findOne(findConditon)
    if(rec){
      return SavedState.update(insRecord, findConditon)
    }
    else{
      return await SavedState.create(insRecord)
    }
  }
  
  SavedState.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await SavedState.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await SavedState.create(insRecord)
    }
  }

  SavedState.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return SavedState.updateAndInsert(...args)
    }
    else{
      return SavedState.update(args[1], args[0])
    }
  }

  SavedState.mergeJson = async (condition, key, vals) => {
    const rec = await SavedState.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return SavedState.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  SavedState.arrayPush = async (condition, key, val) => {
    const rec = await SavedState.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return SavedState.update({[key]: targetArr}, condition)
    }
  }

  SavedState.arrayPull = async (condition, key, val) => {
    const rec = await SavedState.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return SavedState.update({[key]: targetArr}, condition)
    }
  }

  SavedState.remove = (...args) => SavedState.destroy(...args)

  return SavedState
}