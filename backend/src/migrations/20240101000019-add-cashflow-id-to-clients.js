'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'cashflowId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      unique: true,
      after: 'id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'cashflowId');
  },
};
