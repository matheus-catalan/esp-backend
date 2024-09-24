'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class History extends Model {
    static associate(models) {
      History.belongsTo(models.Sensor, {
        foreignKey: 'sensorId',
        onDelete: 'CASCADE',
        as: 'sensor',
      });
      History.belongsTo(models.Environment, {
        foreignKey: 'environmentId',
        onDelete: 'CASCADE',
        as: 'environment',
      });
    }
  }

  History.init({
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'History',
    tableName: 'histories',
    timestamps: true,
  });

  return History;
};
