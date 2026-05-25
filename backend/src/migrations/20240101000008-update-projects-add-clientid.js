'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('projects', 'clientId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.removeColumn('projects', 'clientName');
    await queryInterface.addIndex('projects', ['clientId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('projects', ['clientId']);
    await queryInterface.removeColumn('projects', 'clientId');
    await queryInterface.addColumn('projects', 'clientName', {
      type: Sequelize.STRING(200),
      allowNull: false,
      defaultValue: '',
    });
  },
};
