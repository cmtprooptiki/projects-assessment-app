import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export type ProjectStatus = 'Υπογεγραμμένο' | 'Ολοκληρωμένο' | 'Αποπληρωμένο';

export interface ProjectAttributes {
  id: number;
  cashflowId?: number | null;
  name: string;
  code: string;
  description?: string | null;
  clientId?: number | null;
  startDate: string;
  endDate?: string | null;
  status: ProjectStatus;
  budget?: number | null;
  confirmationOfGoodPerformance?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectCreationAttributes
  extends Optional<
    ProjectAttributes,
    'id' | 'cashflowId' | 'description' | 'endDate' | 'status' | 'clientId' | 'budget' | 'confirmationOfGoodPerformance'
  > {}

class Project
  extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes
{
  public id!: number;
  public cashflowId!: number | null;
  public name!: string;
  public code!: string;
  public description!: string | null;
  public clientId!: number | null;
  public startDate!: string;
  public endDate!: string | null;
  public status!: ProjectStatus;
  public budget!: number | null;
  public confirmationOfGoodPerformance!: string | null;
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
    cashflowId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      unique: true,
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
      type: DataTypes.ENUM('Υπογεγραμμένο', 'Ολοκληρωμένο', 'Αποπληρωμένο'),
      allowNull: false,
      defaultValue: 'Υπογεγραμμένο',
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    confirmationOfGoodPerformance: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'projects',
    modelName: 'Project',
  }
);

export default Project;
