'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('employees', 'fatherName', { type: Sequelize.STRING(100), allowNull: true, defaultValue: null });
    await queryInterface.addColumn('employees', 'motherName', { type: Sequelize.STRING(100), allowNull: true, defaultValue: null });
    await queryInterface.addColumn('employees', 'dateOfBirth', { type: Sequelize.DATEONLY, allowNull: true, defaultValue: null });
    await queryInterface.addColumn('employees', 'placeOfBirth', { type: Sequelize.STRING(200), allowNull: true, defaultValue: null });
    await queryInterface.addColumn('employees', 'phone', { type: Sequelize.STRING(50), allowNull: true, defaultValue: null });
    await queryInterface.addColumn('employees', 'homeAddress', { type: Sequelize.TEXT, allowNull: true, defaultValue: null });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('employees', 'fatherName');
    await queryInterface.removeColumn('employees', 'motherName');
    await queryInterface.removeColumn('employees', 'dateOfBirth');
    await queryInterface.removeColumn('employees', 'placeOfBirth');
    await queryInterface.removeColumn('employees', 'phone');
    await queryInterface.removeColumn('employees', 'homeAddress');
  },
};
