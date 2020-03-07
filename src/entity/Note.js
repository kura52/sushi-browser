const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class Note extends Model {}
  Note.init({
    key: { type: Sequelize.TEXT },
    title: { type: Sequelize.TEXT },
    is_file: { type: Sequelize.BOOLEAN },
    children: { type: Sequelize.JSON },
    created_at: { type: Sequelize.INTEGER },
    updated_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_NOT_KEY', fields: ['key']},
    ],
  sequelize, timestamps: false, modelName: 'note'
  })

  Note.find = (...args) => Note.findAll(...args)
  
  Note.insert = (...args) => {
    if(Array.isArray(args[0])){
      return Note.bulkCreate(...args)
    }
    else{
      return Note.create(...args)
    }
  }

  Note.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await Note.destroy(delConditon, { transaction: t })
      const result = await Note.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  Note.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await Note.findOne(findConditon)
    if(rec){
      return Note.update(insRecord, findConditon)
    }
    else{
      return await Note.create(insRecord)
    }
  }
  
  Note.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await Note.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await Note.create(insRecord)
    }
  }

  Note.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return Note.updateAndInsert(...args)
    }
    else{
      return Note.update(args[1], args[0])
    }
  }

  Note.mergeJson = async (condition, key, vals) => {
    const rec = await Note.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return Note.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  Note.arrayPush = async (condition, key, val) => {
    const rec = await Note.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return Note.update({[key]: targetArr}, condition)
    }
  }

  Note.arrayPull = async (condition, key, val) => {
    const rec = await Note.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return Note.update({[key]: targetArr}, condition)
    }
  }

  Note.remove = (...args) => Note.destroy(...args)

  return Note
}