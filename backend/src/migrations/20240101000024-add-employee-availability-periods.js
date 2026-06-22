'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employee_availability_periods', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      employeeId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onDelete: 'CASCADE',
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Migrate existing workStartDate / workEndDate into availability periods
    const [employees] = await queryInterface.sequelize.query(
      'SELECT id, workStartDate, workEndDate FROM employees WHERE workStartDate IS NOT NULL'
    );
    if (employees.length > 0) {
      await queryInterface.bulkInsert(
        'employee_availability_periods',
        employees.map((emp) => ({
          employeeId: emp.id,
          startDate: emp.workStartDate,
          endDate: emp.workEndDate || null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }

    await queryInterface.removeColumn('employees', 'workStartDate');
    await queryInterface.removeColumn('employees', 'workEndDate');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'workStartDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: 'homeAddress',
    });
    await queryInterface.addColumn('employees', 'workEndDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: 'workStartDate',
    });

    // Restore earliest startDate per employee
    await queryInterface.sequelize.query(`
      UPDATE employees e
      INNER JOIN (
        SELECT employeeId, MIN(startDate) as startDate
        FROM employee_availability_periods
        GROUP BY employeeId
      ) p ON e.id = p.employeeId
      SET e.workStartDate = p.startDate
    `);

    await queryInterface.dropTable('employee_availability_periods');
  },
};
