
const Sequelize = require('sequelize');
const common = require('./common');

module.exports = (sequelize) => {

  const MigrationHistory = sequelize.define('_immigrant_migrations', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: Sequelize.STRING, allowNull: false },
    direction: { type: Sequelize.ENUM('migrate', 'rollback'), allowNull: false },
    executed: { type: Sequelize.DATE, allowNull: false }
  });

  return {
    MigrationHistory
  };

};
