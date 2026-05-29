'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('employee_education', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      employeeId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      institutionName: { type: Sequelize.STRING(300), allowNull: false },
      degreeTitle: { type: Sequelize.STRING(300), allowNull: false },
      specialization: { type: Sequelize.STRING(200), allowNull: true, defaultValue: null },
      dateAwarded: { type: Sequelize.DATEONLY, allowNull: true, defaultValue: null },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('employee_education');
  },
};
