import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ProjectParticipationAttributes {
  id: number;
  employeeId: number;
  projectId: number;
  roleId: number;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  isExternal: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectParticipationCreationAttributes
  extends Optional<ProjectParticipationAttributes, 'id' | 'endDate' | 'notes' | 'isExternal'> {}

class ProjectParticipation
  extends Model<
    ProjectParticipationAttributes,
    ProjectParticipationCreationAttributes
  >
  implements ProjectParticipationAttributes
{
  public id!: number;
  public employeeId!: number;
  public projectId!: number;
  public roleId!: number;
  public startDate!: string;
  public endDate!: string | null;
  public notes!: string | null;
  public isExternal!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProjectParticipation.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
    },
    projectId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isExternal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'project_participations',
    modelName: 'ProjectParticipation',
  }
);

export default ProjectParticipation;
