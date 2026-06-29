'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('employees', 'isExternal', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'isActive',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('employees', 'isExternal');
  },
};
