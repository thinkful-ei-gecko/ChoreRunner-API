const HouseholdsService = {
  insertHousehold(db, newHousehold) {
    console.log('inside household', newHousehold)
    return db
      .insert(newHousehold)
      .into('households')
      .returning('*')
      .then(([household]) => household);
  },
  insertTask(db, newTask){
    return db
      .insert(newTask)
      .into('tasks')
      .returning('*');
  },
};

module.exports = HouseholdsService;
