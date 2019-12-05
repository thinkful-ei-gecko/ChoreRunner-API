const bcrypt = require('bcryptjs');
const xss = require('xss');

const HouseholdsService = {
  insertHousehold(db, newHousehold) {
    return db
      .insert(newHousehold)
      .into('households')
      .returning('*')
      .then(([household]) => household);
  },
  deleteHousehold(db, id) {
    return db('households')
      .where({ id })
      .first()
      .delete();
  },
  insertTask(db, newTask) {
    return db
      .insert(newTask)
      .into('tasks')
      .returning('*');
  },
  getMemberTasks(db, householdId, memberId) {
    return db
      .select(
        'tasks.id',
        'tasks.title',
        'tasks.points',
        'status',
      )
      .from('tasks')
      .where('tasks.household_id', householdId)
      .andWhere('tasks.status', 'assigned')
      .andWhere('tasks.member_id', memberId)
      .groupBy(
        'tasks.id',
        'tasks.title',
        'tasks.points',
        'status'
      );
  },
  getAllHouseholds(db, id) {
    return db
      .select('*')
      .from('households')
      .where('user_id', id);
  },
  getTasksForAll(db, household_id) {
    return db
      .select('tasks.id', 'member_id', 'title', 'points', 'name', 'username')
      .from('tasks')
      .join('members', 'members.id', 'tasks.member_id')
      .where('members.household_id', household_id);
  },
  getCompletedTasks(db, household_id, status) {
    return db
      .select('*')
      .from('tasks')
      .where('household_id', household_id)
      .andWhere('status', status);
  },
  parentUpdateTaskStatus(db, taskId, newStatus) {
    return db('tasks')
      .where('id', taskId)
      .update({
        status: newStatus
      })
      .returning('*');
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
  deleteMember(db, member_id) {
    return db('members')
      .where('id', member_id)
      .delete();
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeMember(member) {
    return {
      id: member.id,
      name: xss(member.name),
      username: xss(member.username),
      household_id: member.household_id,
      parent_id: member.user_id,
    };
  },
  updateTaskPoints(db, id, newPoints) {
    return db
      .from('tasks')
      .where('id', id)
      .update({
        points: newPoints,
      });
  },
  updateTaskTitle(db, id, newTitle) {
    return db
      .from('tasks')
      .where('id', id)
      .update({
        title: newTitle,
      });
  },

  updateMember(db, id, updatedMember) {
    return db('members')
      .where({ id })
      .update(updatedMember)
      .returning('*');
  },

  //This method is for deleting a task from user's dashboard
  deleteTask(db, taskId) {
    return db('tasks')
      .where('tasks.id', taskId)
      .delete();
  },

  //this method updated the task status to 'completed when the child marks it as done.
  //Might want to return something?
  completeTask(db, member_id, household_id, taskId) {
    return db('tasks')
      .where('tasks.member_id', member_id)
      .andWhere('tasks.household_id', household_id)
      .andWhere('tasks.id', taskId)
      .update('status', 'completed');
  },

  //For patch method on router "/:id"
  serializeHousehold(household) {
    return {
      id: household.id,
      name: xss(household.name),
      user_id: household.user_id,
    };
  },

  updateHouseholdName(db, id, newHousehold) {
    return db
      .from('households')
      .where({ id })
      .update(newHousehold);
  },
  
  //To get scores for the leaderboard
  getHouseholdScores(db, household_id) {
    return db
      .select('members.id', 'members.name', 'members.total_score')
      .from('members')
      .where('members.household_id', household_id)
  }
};

module.exports = HouseholdsService;
