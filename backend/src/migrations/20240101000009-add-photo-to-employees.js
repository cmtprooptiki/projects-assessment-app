'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'photo', {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null,
      after: 'isActive',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('employees', 'photo');
  },
};
