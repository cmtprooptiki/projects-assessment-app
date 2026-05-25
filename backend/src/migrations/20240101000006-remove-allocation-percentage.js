'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('project_participations', 'allocationPercentage');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('project_participations', 'allocationPercentage', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 100,
    });
  },
};
