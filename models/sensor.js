'use strict';
module.exports = (sequelize, DataTypes) => {
  const Sensor = sequelize.define('Sensor', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    current_value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alert_sound: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    alert_light: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    alert_notification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    max_value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: false,
    },
    min_value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: false,
    },
    is_internal: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    environmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Environments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  Sensor.associate = function (models) {
    // associa o sensor ao ambiente
    Sensor.belongsTo(models.Environment, {
      foreignKey: 'environmentId',
      as: 'environment',
    });
    Sensor.hasMany(models.History, {
      foreignKey: 'sensorId',
      as: 'histories',
      onDelete: 'CASCADE',
    });
  };

  return Sensor;
};
