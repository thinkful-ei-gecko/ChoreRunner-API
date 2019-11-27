const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const MembersService = {
  hasUserWithUserName(db, username) {
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
  // validatePassword(password) {
  //   if (password.length < 8) {
  //     return 'Password be longer than 8 characters';
  //   }
  //   if (password.length > 72) {
  //     return 'Password be less than 72 characters';
  //   }
  //   if (password.startsWith(' ') || password.endsWith(' ')) {
  //     return 'Password must not start or end with empty spaces';
  //   }
  //   if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
  //     return 'Password must contain one upper case, lower case, number and special character';
  //   }
  //   return null;
  // },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeMember(member) {
    return {
      id: member.id,
      name: member.name,
      username: member.username,
    };
  },
 
};

module.exports = MembersService;
