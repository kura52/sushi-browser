const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class SearchEngine extends Model {}
  SearchEngine.init({
    name: { type: Sequelize.TEXT },
    base: { type: Sequelize.TEXT },
    image: { type: Sequelize.TEXT },
    search: { type: Sequelize.TEXT },
    shortcut: { type: Sequelize.TEXT },
    ind: { type: Sequelize.INTEGER },
    updated_at: { type: Sequelize.INTEGER },
    multiple: { type: Sequelize.JSON },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  sequelize, timestamps: false, modelName: 'searchEngine'
  })

  SearchEngine.find = (...args) => SearchEngine.findAll(...args)
  
  SearchEngine.insert = (...args) => {
    if(Array.isArray(args[0])){
      return SearchEngine.bulkCreate(...args)
    }
    else{
      return SearchEngine.create(...args)
    }
  }

  SearchEngine.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await SearchEngine.destroy(delConditon, { transaction: t })
      const result = await SearchEngine.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  SearchEngine.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await SearchEngine.findOne(findConditon)
    if(rec){
      return SearchEngine.update(insRecord, findConditon)
    }
    else{
      return await SearchEngine.create(insRecord)
    }
  }
  
  SearchEngine.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await SearchEngine.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await SearchEngine.create(insRecord)
    }
  }

  SearchEngine.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return SearchEngine.updateAndInsert(...args)
    }
    else{
      return SearchEngine.update(args[1], args[0])
    }
  }

  SearchEngine.mergeJson = async (condition, key, vals) => {
    const rec = await SearchEngine.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return SearchEngine.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  SearchEngine.arrayPush = async (condition, key, val) => {
    const rec = await SearchEngine.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return SearchEngine.update({[key]: targetArr}, condition)
    }
  }

  SearchEngine.arrayPull = async (condition, key, val) => {
    const rec = await SearchEngine.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return SearchEngine.update({[key]: targetArr}, condition)
    }
  }

  SearchEngine.remove = (...args) => SearchEngine.destroy(...args)

  return SearchEngine
}