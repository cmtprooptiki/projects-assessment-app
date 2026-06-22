import Employee from './Employee';
import Project from './Project';
import Contract from './Contract';
import Role from './Role';
import ProjectParticipation from './ProjectParticipation';
import User from './User';
import Client from './Client';
import Department from './Department';
import Education from './Education';
import Language from './Language';
import EmployeeAvailabilityPeriod from './EmployeeAvailabilityPeriod';

// Client associations
Client.hasMany(Project, { foreignKey: 'clientId', as: 'projects' });
Project.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Contract, { foreignKey: 'clientId', as: 'contracts' });
Contract.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Project → Contract associations
Project.hasMany(Contract, { foreignKey: 'projectId', as: 'contracts', onDelete: 'SET NULL' });
Contract.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Contract (was Project) associations
Contract.hasMany(ProjectParticipation, { foreignKey: 'projectId', as: 'participations', onDelete: 'CASCADE' });

// Employee associations
Employee.hasMany(ProjectParticipation, { foreignKey: 'employeeId', as: 'participations', onDelete: 'CASCADE' });
Employee.hasMany(Education, { foreignKey: 'employeeId', as: 'education', onDelete: 'CASCADE' });
Education.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(Language, { foreignKey: 'employeeId', as: 'languages', onDelete: 'CASCADE' });
Language.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(EmployeeAvailabilityPeriod, { foreignKey: 'employeeId', as: 'availabilityPeriods', onDelete: 'CASCADE' });
EmployeeAvailabilityPeriod.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Role associations
Role.hasMany(ProjectParticipation, { foreignKey: 'roleId', as: 'participations', onDelete: 'RESTRICT' });

// ProjectParticipation associations — 'project' alias kept so API responses are unchanged
ProjectParticipation.belongsTo(Contract, { foreignKey: 'projectId', as: 'project' });
ProjectParticipation.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
ProjectParticipation.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

export {
  Employee, Project, Contract, Role, ProjectParticipation,
  User, Client, Department, Education, Language, EmployeeAvailabilityPeriod,
};
