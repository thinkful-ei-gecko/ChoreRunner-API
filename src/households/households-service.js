const bcrypt = require('bcryptjs');

const HouseholdsService = {
  insertHousehold(db, newHousehold) {
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
  getAllHouseholds(db, id) {
    return db
      .select('*')
      .from('households')
      .where('user_id', id);
  },
  getTasksForAll(db, household_id) {
    return db
      .select('tasks.id', 'member_id', 'title', 'points', 'name' )
      .from('tasks')
      .leftJoin('members', 'members.id', 'tasks.member_id')
      .where('members.household_id', household_id);
  },
  getAllMembers(db, id) {
    return db
      .select('*')
      .from('members')
      .where('household_id', id);
  },
  hasMemberwithMemberName(db, username) {
    return db('members')
      .where({ username })
      .first()
      .then(member => !!member);
  },
  insertMember(db, newMember) {
    return db
      .insert(newMember)
      .into('members')
      .returning('*')
      .then(([member]) => member);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeMember(member) {
    return {
      id: member.id,
      name: member.name,
      username: member.username,
      household_id: member.household_id,
      parent_id: member.user_id,
    };
  },
  //This method is for deleting a task from user's dashboard
  deleteTask(db, taskId) {
    return db('tasks')
      .where('tasks.id', taskId)
      .delete();
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
