'use strict';
module.exports = (sequelize, DataTypes) => {
  const Environment = sequelize.define('Environment', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    light_alert: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    sound_alert: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    notification_alert: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    floor_plan_x: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    floor_plan_y: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: true
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
    count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
  }, {
    timestamps: true,
  });

  Environment.associate = function (models) {
    Environment.hasMany(models.Sensor, {
      foreignKey: 'environmentId',
      as: 'sensors', // Definindo o alias 'sensors'
      onDelete: 'CASCADE',
    });
    Environment.hasMany(models.History, {
      foreignKey: 'environmentId',
      as: 'histories',
      onDelete: 'CASCADE',
    });
  };

  return Environment;
};
