'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employee_education', 'recognized', {
      type: Sequelize.ENUM('yes', 'no'),
      allowNull: true,
      defaultValue: null,
      after: 'dateAwarded',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('employee_education', 'recognized');
  },
};
