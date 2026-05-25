import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface EmployeeAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  isActive: boolean;
  photo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeCreationAttributes
  extends Optional<EmployeeAttributes, 'id' | 'isActive' | 'photo'> {}

class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public department!: string;
  public isActive!: boolean;
  public photo!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING(100), allowNull: false },
    lastName: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    department: { type: DataTypes.STRING(100), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    photo: { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
  },
  { sequelize, tableName: 'employees', modelName: 'Employee' }
);

export default Employee;
