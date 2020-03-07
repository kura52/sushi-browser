const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class MigrationMeta extends Model {}
  MigrationMeta.init({
    ver: { type: Sequelize.TEXT },
    info: { type: Sequelize.JSON },
    updated_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
    sequelize, timestamps: false, modelName: 'migrationMeta'
  })

  MigrationMeta.find = (...args) => MigrationMeta.findAll(...args)

  MigrationMeta.insert = (...args) => {
    if(Array.isArray(args[0])){
      return MigrationMeta.bulkCreate(...args)
    }
    else{
      return MigrationMeta.create(...args)
    }
  }

  MigrationMeta.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await MigrationMeta.destroy(delConditon, { transaction: t })
      const result = await MigrationMeta.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  MigrationMeta.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await MigrationMeta.findOne(findConditon)
    if(rec){
      return MigrationMeta.update(insRecord, findConditon)
    }
    else{
      return await MigrationMeta.create(insRecord)
    }
  }

  MigrationMeta.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await MigrationMeta.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await MigrationMeta.create(insRecord)
    }
  }

  MigrationMeta.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return MigrationMeta.updateAndInsert(...args)
    }
    else{
      return MigrationMeta.update(args[1], args[0])
    }
  }

  MigrationMeta.mergeJson = async (condition, key, vals) => {
    const rec = await MigrationMeta.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return MigrationMeta.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  MigrationMeta.arrayPush = async (condition, key, val) => {
    const rec = await MigrationMeta.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return MigrationMeta.update({[key]: targetArr}, condition)
    }
  }

  MigrationMeta.arrayPull = async (condition, key, val) => {
    const rec = await MigrationMeta.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return MigrationMeta.update({[key]: targetArr}, condition)
    }
  }


  MigrationMeta.remove = (...args) => MigrationMeta.destroy(...args)


  return MigrationMeta
}