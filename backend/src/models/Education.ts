import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export type RecognizedValue = 'yes' | 'no';

export interface EducationAttributes {
  id: number;
  employeeId: number;
  institutionName: string;
  degreeTitle: string;
  specialization?: string | null;
  dateAwarded?: string | null;
  recognized?: RecognizedValue | null;
  degreeType?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EducationCreationAttributes
  extends Optional<EducationAttributes, 'id' | 'specialization' | 'dateAwarded' | 'recognized' | 'degreeType'> {}

class Education
  extends Model<EducationAttributes, EducationCreationAttributes>
  implements EducationAttributes
{
  public id!: number;
  public employeeId!: number;
  public institutionName!: string;
  public degreeTitle!: string;
  public specialization!: string | null;
  public dateAwarded!: string | null;
  public recognized!: RecognizedValue | null;
  public degreeType!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Education.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    institutionName: { type: DataTypes.STRING(300), allowNull: false },
    degreeTitle: { type: DataTypes.STRING(300), allowNull: false },
    specialization: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
    dateAwarded: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
    recognized: { type: DataTypes.ENUM('yes', 'no'), allowNull: true, defaultValue: null },
    degreeType: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
  },
  { sequelize, tableName: 'employee_education', modelName: 'Education' }
);

export default Education;
