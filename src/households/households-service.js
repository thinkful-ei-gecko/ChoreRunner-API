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
  getAllHouseholds(db, id) {
    return db
      .select('*')
      .from('households')
      .where('user_id', id);
  },
  getAllTasks(db, id) {
    return db
      .select('*')
      .from('tasks')
      .where('household_id', id);
  },
  getAllMembers(db, id) {
    return db
      .select('*')
      .from('members')
      .where('household_id', id);
  },
};

module.exports = HouseholdsService;
