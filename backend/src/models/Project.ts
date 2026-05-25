import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';

export interface ProjectAttributes {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  clientId?: number | null;
  startDate: string;
  endDate?: string | null;
  status: ProjectStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectCreationAttributes
  extends Optional<
    ProjectAttributes,
    'id' | 'description' | 'endDate' | 'status' | 'clientId'
  > {}

class Project
  extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes
{
  public id!: number;
  public name!: string;
  public code!: string;
  public description!: string | null;
  public clientId!: number | null;
  public startDate!: string;
  public endDate!: string | null;
  public status!: ProjectStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'clients', key: 'id' },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'on_hold', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'projects',
    modelName: 'Project',
  }
);

export default Project;
