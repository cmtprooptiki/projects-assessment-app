'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'code', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
      after: 'name',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'code');
  },
};
