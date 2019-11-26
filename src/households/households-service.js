const HouseholdsService = {
  insertHousehold(db, newHousehold) {
    return db
      .insert(newHousehold)
      .into('households')
      .returning('*')
      .then(([household]) => household);
  },
};

module.exports = HouseholdsService;
