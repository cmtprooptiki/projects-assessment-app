import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface EmployeeCertificationAttributes {
  id: number;
  employeeId: number;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeCertificationCreationAttributes
  extends Optional<EmployeeCertificationAttributes, 'id'> {}

class EmployeeCertification
  extends Model<EmployeeCertificationAttributes, EmployeeCertificationCreationAttributes>
  implements EmployeeCertificationAttributes
{
  public id!: number;
  public employeeId!: number;
  public text!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmployeeCertification.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, tableName: 'employee_certifications', modelName: 'EmployeeCertification' }
);

export default EmployeeCertification;
