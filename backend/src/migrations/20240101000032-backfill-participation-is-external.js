'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE project_participations pp
      JOIN employees e ON pp.employeeId = e.id
      SET pp.isExternal = TRUE
      WHERE e.isExternal = TRUE
    `);
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE project_participations pp
      JOIN employees e ON pp.employeeId = e.id
      SET pp.isExternal = FALSE
      WHERE e.isExternal = TRUE
    `);
  },
};
