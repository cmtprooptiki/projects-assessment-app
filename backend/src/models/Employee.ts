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
  fatherName?: string | null;
  motherName?: string | null;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  phone?: string | null;
  homeAddress?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeCreationAttributes
  extends Optional<EmployeeAttributes, 'id' | 'isActive' | 'photo' | 'fatherName' | 'motherName' | 'dateOfBirth' | 'placeOfBirth' | 'phone' | 'homeAddress'> {}

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
  public fatherName!: string | null;
  public motherName!: string | null;
  public dateOfBirth!: string | null;
  public placeOfBirth!: string | null;
  public phone!: string | null;
  public homeAddress!: string | null;
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
    fatherName: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
    motherName: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
    dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
    placeOfBirth: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
    phone: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
    homeAddress: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  },
  { sequelize, tableName: 'employees', modelName: 'Employee' }
);

export default Employee;
