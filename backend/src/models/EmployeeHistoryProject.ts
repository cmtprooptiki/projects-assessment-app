import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface EmployeeHistoryProjectAttributes {
  id: number;
  employeeId: number;
  projectName: string;
  role?: string | null;
  employerName?: string | null;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeHistoryProjectCreationAttributes
  extends Optional<EmployeeHistoryProjectAttributes, 'id' | 'role' | 'employerName' | 'endDate' | 'description'> {}

class EmployeeHistoryProject
  extends Model<EmployeeHistoryProjectAttributes, EmployeeHistoryProjectCreationAttributes>
  implements EmployeeHistoryProjectAttributes
{
  public id!: number;
  public employeeId!: number;
  public projectName!: string;
  public role!: string | null;
  public employerName!: string | null;
  public startDate!: string;
  public endDate!: string | null;
  public description!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmployeeHistoryProject.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    projectName: { type: DataTypes.STRING(300), allowNull: false },
    role: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
    employerName: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
    description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  },
  { sequelize, tableName: 'employee_history_projects', modelName: 'EmployeeHistoryProject' }
);

export default EmployeeHistoryProject;
