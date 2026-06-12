'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'azureId', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
      after: 'id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('employees', 'azureId');
  },
};
