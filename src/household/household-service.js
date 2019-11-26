const HouseholdService = {
  insertTask(db, newTask){
    return db
      .insert(newTask)
      .into('tasks')
      .returning('*');
  },
};

module.exports = HouseholdService;