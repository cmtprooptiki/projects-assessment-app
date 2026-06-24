'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('employee_education', 'degreeType', {
      type: Sequelize.STRING(200),
      allowNull: true,
      defaultValue: null,
      after: 'recognized',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('employee_education', 'degreeType');
  },
};
