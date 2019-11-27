

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const MembersService = {

  // validatePassword(password) {
  //   if (password.length < 5) {
  //     return 'Password be longer than 8 characters';
  //   }
  //   if (password.length > 20) {
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
  
 
};

module.exports = MembersService;
