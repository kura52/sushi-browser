const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class Favicon extends Model {}
  Favicon.init({
    url: { type: Sequelize.TEXT },
    data: { type: Sequelize.TEXT },
    status: { type: Sequelize.TEXT },
    created_at: { type: Sequelize.INTEGER },
    updated_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_FAV_URL', fields: ['url']},
    ],
  sequelize, timestamps: false, modelName: 'favicon'
  })

  Favicon.find = (...args) => Favicon.findAll(...args)
  
  Favicon.insert = (...args) => {
    if(Array.isArray(args[0])){
      return Favicon.bulkCreate(...args)
    }
    else{
      return Favicon.create(...args)
    }
  }

  Favicon.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await Favicon.destroy(delConditon, { transaction: t })
      const result = await Favicon.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  Favicon.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await Favicon.findOne(findConditon)
    if(rec){
      return Favicon.update(insRecord, findConditon)
    }
    else{
      return await Favicon.create(insRecord)
    }
  }
  
  Favicon.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await Favicon.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await Favicon.create(insRecord)
    }
  }

  Favicon.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return Favicon.updateAndInsert(...args)
    }
    else{
      return Favicon.update(args[1], args[0])
    }
  }

  Favicon.mergeJson = async (condition, key, vals) => {
    const rec = await Favicon.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return Favicon.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  Favicon.arrayPush = async (condition, key, val) => {
    const rec = await Favicon.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return Favicon.update({[key]: targetArr}, condition)
    }
  }

  Favicon.arrayPull = async (condition, key, val) => {
    const rec = await Favicon.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return Favicon.update({[key]: targetArr}, condition)
    }
  }

  Favicon.remove = (...args) => Favicon.destroy(...args)

  return Favicon
}