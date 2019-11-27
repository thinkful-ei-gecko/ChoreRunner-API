const bcrypt = require('bcryptjs');

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
};

module.exports = HouseholdsService;
