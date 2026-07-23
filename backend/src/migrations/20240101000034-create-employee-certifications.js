'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('employee_certifications', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      employeeId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onDelete: 'CASCADE',
      },
      text: { type: Sequelize.TEXT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('employee_certifications');
  },
};
