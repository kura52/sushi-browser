const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

module.exports = function(sequelize) {
  class TabState extends Model {}
  TabState.init({
    id: { type: Sequelize.INTEGER },
    index: { type: Sequelize.INTEGER },
    windowId: { type: Sequelize.INTEGER },
    active: { type: Sequelize.BOOLEAN },
    close: { type: Sequelize.INTEGER },
    pinned: { type: Sequelize.BOOLEAN },
    tabKey: { type: Sequelize.TEXT },
    titles: { type: Sequelize.TEXT },
    urls: { type: Sequelize.TEXT },
    positions: { type: Sequelize.TEXT },
    currentIndex: { type: Sequelize.INTEGER },
    updated_at: { type: Sequelize.INTEGER },
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
  },
  {
  indexes: [
      { name: 'I_SYN_TAB_KEY', fields: ['tabKey']},
    ],
  sequelize, timestamps: false, modelName: 'tabState'
  })

  TabState.find = (...args) => TabState.findAll(...args)
  
  TabState.insert = (...args) => {
    if(Array.isArray(args[0])){
      return TabState.bulkCreate(...args)
    }
    else{
      return TabState.create(...args)
    }
  }

  TabState.deleteAndInsert = async (...args) => {
    const delConditon = args[0]
    const insRecord = args[1]

    const t = await sequelize.transaction()
    try{
      await TabState.destroy(delConditon, { transaction: t })
      const result = await TabState.create(insRecord, { transaction: t })
      await t.commit()
      return result

    } catch(error) {
      await t.rollback()
      console.log(error)
      return null
    }
  }

  TabState.findAndMerge = async (...args) => {
    const findConditon = args[0]
    const insRecord = args[1]

    let rec = await TabState.findOne(findConditon)
    if(rec){
      return TabState.update(insRecord, findConditon)
    }
    else{
      return await TabState.create(insRecord)
    }
  }
  
  TabState.updateAndInsert = async (...args) => {
    const updConditon = args[0]
    const insRecord = args[1]

    let rec = await TabState.update(insRecord, updConditon)
    if(rec[0] == 0){
      return await TabState.create(insRecord)
    }
  }

  TabState.update2 = (...args) => {
    if(args[2] && args[2].upsert){
      return TabState.updateAndInsert(...args)
    }
    else{
      return TabState.update(args[1], args[0])
    }
  }

  TabState.mergeJson = async (condition, key, vals) => {
    const rec = await TabState.findOne(condition)
    if(rec){
      const targetJson = rec[key]
      return TabState.update({[key]: {...targetJson, ...vals}}, condition)
    }
  }

  TabState.arrayPush = async (condition, key, val) => {
    const rec = await TabState.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      targetArr.push(val)
      return TabState.update({[key]: targetArr}, condition)
    }
  }

  TabState.arrayPull = async (condition, key, val) => {
    const rec = await TabState.findOne(condition)
    if(rec){
      const targetArr = rec[key]
      const index = targetArr.indexOf(val)
      if(index != -1) targetArr.splice(index, 1)

      return TabState.update({[key]: targetArr}, condition)
    }
  }

  TabState.remove = (...args) => TabState.destroy(...args)

  return TabState
}