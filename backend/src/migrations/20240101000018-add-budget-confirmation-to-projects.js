'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('projects', 'budget', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
      after: 'status',
    });
    await queryInterface.addColumn('projects', 'confirmationOfGoodPerformance', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'budget',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('projects', 'budget');
    await queryInterface.removeColumn('projects', 'confirmationOfGoodPerformance');
  },
};
