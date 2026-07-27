'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('employees', 'firstNameGr', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: null,
      after: 'firstName',
    });
    await queryInterface.addColumn('employees', 'lastNameGr', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: null,
      after: 'lastName',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('employees', 'firstNameGr');
    await queryInterface.removeColumn('employees', 'lastNameGr');
  },
};
