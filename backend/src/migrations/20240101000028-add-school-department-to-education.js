'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('employee_education', 'schoolName', {
      type: Sequelize.STRING(300),
      allowNull: true,
      defaultValue: null,
      after: 'institutionName',
    });
    await queryInterface.addColumn('employee_education', 'departmentName', {
      type: Sequelize.STRING(300),
      allowNull: true,
      defaultValue: null,
      after: 'schoolName',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('employee_education', 'departmentName');
    await queryInterface.removeColumn('employee_education', 'schoolName');
  },
};
