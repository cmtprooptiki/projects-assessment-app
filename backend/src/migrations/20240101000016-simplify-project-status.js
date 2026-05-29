'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Normalize existing data: endDate present → completed, otherwise → active
    await queryInterface.sequelize.query(
      `UPDATE projects SET status = IF(endDate IS NOT NULL, 'completed', 'active')`
    );

    // Narrow the ENUM to only the two valid values
    await queryInterface.changeColumn('projects', 'status', {
      type: Sequelize.ENUM('active', 'completed'),
      allowNull: false,
      defaultValue: 'active',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('projects', 'status', {
      type: Sequelize.ENUM('active', 'completed', 'on_hold', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    });
  },
};
