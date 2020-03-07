const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class Visit extends Model {}
  Visit.init({
    url: { type: Sequelize.TEXT },
    created_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_VIS_URL', fields: ['url']},
    ],
  sequelize, timestamps: false, modelName: 'visit'
  })

  Visit.find = (...args) => Visit.findAll(...args)
  
  Visit.insert = (...args) => {
    if(Array.isArray(args[0])){
      return Visit.bulkCreate(...args)
    }
    else{
      return Visit.create(...args)
    }
  }

  Visit.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await Visit.destroy(delConditon, { transaction: t })
      const result = await Visit.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  Visit.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await Visit.findOne(findConditon)
    if(rec){
      return Visit.update(insRecord, findConditon)
    }
    else{
      return await Visit.create(insRecord)
    }
  }
  
  Visit.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await Visit.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await Visit.create(insRecord)
    }
  }

  Visit.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return Visit.updateAndInsert(...args)
    }
    else{
      return Visit.update(args[1], args[0])
    }
  }

  Visit.mergeJson = async (condition, key, vals) => {
    const rec = await Visit.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return Visit.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  Visit.arrayPush = async (condition, key, val) => {
    const rec = await Visit.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return Visit.update({[key]: targetArr}, condition)
    }
  }

  Visit.arrayPull = async (condition, key, val) => {
    const rec = await Visit.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return Visit.update({[key]: targetArr}, condition)
    }
  }

  Visit.remove = (...args) => Visit.destroy(...args)

  return Visit
}