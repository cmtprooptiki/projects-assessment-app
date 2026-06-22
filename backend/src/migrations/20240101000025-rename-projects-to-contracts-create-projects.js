'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Rename old projects table → contracts
    //    MySQL automatically updates the FK in project_participations to reference contracts
    await queryInterface.renameTable('projects', 'contracts');

    // 2. Create new projects table
    await queryInterface.createTable('projects', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      projectCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      acronym: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      clientId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'clients', key: 'id' },
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // 3. Add nullable projectId FK to contracts → references new projects
    await queryInterface.addColumn('contracts', 'projectId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      references: { model: 'projects', key: 'id' },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove projectId from contracts
    await queryInterface.removeColumn('contracts', 'projectId');

    // 2. Drop new projects table
    await queryInterface.dropTable('projects');

    // 3. Rename contracts back to projects
    await queryInterface.renameTable('contracts', 'projects');
  },
};
