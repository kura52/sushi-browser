const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class Image extends Model {}
  Image.init({
    url: { type: Sequelize.TEXT },
    path: { type: Sequelize.TEXT },
    title: { type: Sequelize.TEXT },
    created_at: { type: Sequelize.INTEGER },
    updated_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_IMA_URL', fields: ['url']},
    ],
  sequelize, timestamps: false, modelName: 'image'
  })

  Image.find = (...args) => Image.findAll(...args)
  
  Image.insert = (...args) => {
    if(Array.isArray(args[0])){
      return Image.bulkCreate(...args)
    }
    else{
      return Image.create(...args)
    }
  }

  Image.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await Image.destroy(delConditon, { transaction: t })
      const result = await Image.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  Image.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await Image.findOne(findConditon)
    if(rec){
      return Image.update(insRecord, findConditon)
    }
    else{
      return await Image.create(insRecord)
    }
  }
  
  Image.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await Image.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await Image.create(insRecord)
    }
  }

  Image.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return Image.updateAndInsert(...args)
    }
    else{
      return Image.update(args[1], args[0])
    }
  }

  Image.mergeJson = async (condition, key, vals) => {
    const rec = await Image.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return Image.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  Image.arrayPush = async (condition, key, val) => {
    const rec = await Image.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return Image.update({[key]: targetArr}, condition)
    }
  }

  Image.arrayPull = async (condition, key, val) => {
    const rec = await Image.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return Image.update({[key]: targetArr}, condition)
    }
  }

  Image.remove = (...args) => Image.destroy(...args)

  return Image
}