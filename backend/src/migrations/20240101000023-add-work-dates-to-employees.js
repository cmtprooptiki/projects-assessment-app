'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'workStartDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: 'homeAddress',
    });
    await queryInterface.addColumn('employees', 'workEndDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: 'workStartDate',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('employees', 'workEndDate');
    await queryInterface.removeColumn('employees', 'workStartDate');
  },
};
