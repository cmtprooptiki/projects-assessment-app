'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE projects MODIFY COLUMN status ENUM('Υπογεγραμμένο', 'Ολοκληρωμένο', 'Αποπληρωμένο') NOT NULL DEFAULT 'Υπογεγραμμένο'"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE projects MODIFY COLUMN status ENUM('active', 'completed') NOT NULL DEFAULT 'active'"
    );
  },
};
