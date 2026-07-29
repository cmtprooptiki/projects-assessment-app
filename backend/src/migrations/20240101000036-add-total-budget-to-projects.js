'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('projects', 'totalBudget', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: null,
      after: 'description',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('projects', 'totalBudget');
  },
};
