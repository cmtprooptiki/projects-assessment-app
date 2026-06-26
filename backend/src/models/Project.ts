import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ProjectAttributes {
  id: number;
  projectCode: string;
  name: string;
  acronym: string;
  description?: string | null;
  clientId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectCreationAttributes
  extends Optional<ProjectAttributes, 'id' | 'description' | 'clientId'> {}

class Project
  extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes
{
  public id!: number;
  public projectCode!: string;
  public name!: string;
  public acronym!: string;
  public description!: string | null;
  public clientId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    projectCode: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(800), allowNull: false },
    acronym: { type: DataTypes.STRING(50), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    clientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'clients', key: 'id' },
    },
  },
  { sequelize, tableName: 'projects', modelName: 'Project' }
);

export default Project;
