import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface AvailabilityPeriodAttributes {
  id: number;
  employeeId: number;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AvailabilityPeriodCreationAttributes
  extends Optional<AvailabilityPeriodAttributes, 'id' | 'endDate' | 'notes'> {}

class EmployeeAvailabilityPeriod
  extends Model<AvailabilityPeriodAttributes, AvailabilityPeriodCreationAttributes>
  implements AvailabilityPeriodAttributes
{
  public id!: number;
  public employeeId!: number;
  public startDate!: string;
  public endDate!: string | null;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmployeeAvailabilityPeriod.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
    notes: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: 'employee_availability_periods',
    modelName: 'EmployeeAvailabilityPeriod',
  }
);

export default EmployeeAvailabilityPeriod;
