'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'roleId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      references: { model: 'roles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'isActive',
    });

    await queryInterface.removeColumn('employees', 'position');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'position', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: '',
    });

    await queryInterface.removeColumn('employees', 'roleId');
  },
};
