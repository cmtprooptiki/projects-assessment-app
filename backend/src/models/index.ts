import Employee from './Employee';
import Project from './Project';
import Role from './Role';
import ProjectParticipation from './ProjectParticipation';
import User from './User';
import Client from './Client';
import Department from './Department';
import Education from './Education';
import Language from './Language';

// Client associations
Client.hasMany(Project, { foreignKey: 'clientId', as: 'projects' });
Project.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Project associations
Project.hasMany(ProjectParticipation, { foreignKey: 'projectId', as: 'participations', onDelete: 'CASCADE' });

// Employee associations
Employee.hasMany(ProjectParticipation, { foreignKey: 'employeeId', as: 'participations', onDelete: 'CASCADE' });
Employee.hasMany(Education, { foreignKey: 'employeeId', as: 'education', onDelete: 'CASCADE' });
Education.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(Language, { foreignKey: 'employeeId', as: 'languages', onDelete: 'CASCADE' });
Language.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Role associations
Role.hasMany(ProjectParticipation, { foreignKey: 'roleId', as: 'participations', onDelete: 'RESTRICT' });

// ProjectParticipation associations
ProjectParticipation.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
ProjectParticipation.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
ProjectParticipation.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

export { Employee, Project, Role, ProjectParticipation, User, Client, Department, Education, Language };
