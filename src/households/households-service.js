const HouseholdsService = {
  insertHousehold(db, newHousehold) {
    console.log('inside household', newHousehold);
    return db
      .insert(newHousehold)
      .into('households')
      .returning('*')
      .then(([household]) => household);
  },
  insertTask(db, newTask) {
    return db
      .insert(newTask)
      .into('tasks')
      .returning('*');
  },

  getMemberTasks(db, householdId, memberId) {
    return db
      .select('tasks.id', 'tasks.title', 'tasks.points')
      .from('tasks')
      .where('tasks.household_id', householdId)
      .andWhere('tasks.member_id', memberId)
      .groupBy('tasks.id', 'tasks.title', 'tasks.points');
  },
};

module.exports = HouseholdsService;
