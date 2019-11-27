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

  //THIS METHOD IS NOT FOR DELETING A TASK. IT WILL ULTIMATELY NEED TO ASSIGN POINTS...
  //SOMEHOW.
  completeTask(db, member_id, household_id, taskId) {
    return db('tasks')
      .where('tasks.member_id', member_id)
      .andWhere('tasks.household_id', household_id)
      .andWhere('tasks.id', taskId)
      .delete();
  },
};

module.exports = HouseholdsService;
