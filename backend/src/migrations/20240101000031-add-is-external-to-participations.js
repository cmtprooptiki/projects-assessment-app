'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('project_participations', 'isExternal', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'notes',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('project_participations', 'isExternal');
  },
};
