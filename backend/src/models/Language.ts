import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface LanguageAttributes {
  id: number;
  employeeId: number;
  language: string;
  degreeTitle?: string | null;
  level?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LanguageCreationAttributes
  extends Optional<LanguageAttributes, 'id' | 'degreeTitle' | 'level'> {}

class Language
  extends Model<LanguageAttributes, LanguageCreationAttributes>
  implements LanguageAttributes
{
  public id!: number;
  public employeeId!: number;
  public language!: string;
  public degreeTitle!: string | null;
  public level!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Language.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    language: { type: DataTypes.STRING(100), allowNull: false },
    degreeTitle: { type: DataTypes.STRING(300), allowNull: true, defaultValue: null },
    level: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
  },
  { sequelize, tableName: 'employee_languages', modelName: 'Language' }
);

export default Language;
