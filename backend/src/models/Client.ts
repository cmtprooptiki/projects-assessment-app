import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ClientAttributes {
  id: number;
  cashflowId?: number | null;
  name: string;
  code?: string | null;
  industry?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientCreationAttributes
  extends Optional<ClientAttributes, 'id' | 'cashflowId' | 'code' | 'industry' | 'contactEmail' | 'contactPhone' | 'notes'> {}

class Client
  extends Model<ClientAttributes, ClientCreationAttributes>
  implements ClientAttributes
{
  public id!: number;
  public cashflowId!: number | null;
  public name!: string;
  public code!: string | null;
  public industry!: string | null;
  public contactEmail!: string | null;
  public contactPhone!: string | null;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
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
      unique: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    industry: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contactPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'clients',
    modelName: 'Client',
  }
);

export default Client;
