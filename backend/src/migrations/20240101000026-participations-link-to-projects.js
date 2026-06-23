'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Clear existing data — user confirmed existing records are not needed
    await queryInterface.sequelize.query('DELETE FROM project_participations');

    // Remove old projectId (FK to contracts)
    await queryInterface.removeColumn('project_participations', 'projectId');

    // Add new projectId (FK to projects)
    await queryInterface.addColumn('project_participations', 'projectId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      after: 'employeeId',
      references: { model: 'projects', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Remove allocationPercentage if it still exists
    const tableDesc = await queryInterface.describeTable('project_participations');
    if (tableDesc.allocationPercentage) {
      await queryInterface.removeColumn('project_participations', 'allocationPercentage');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DELETE FROM project_participations');
    await queryInterface.removeColumn('project_participations', 'projectId');
    await queryInterface.addColumn('project_participations', 'projectId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      after: 'employeeId',
      references: { model: 'contracts', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
};
