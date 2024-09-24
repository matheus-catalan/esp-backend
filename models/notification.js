'use strict';
const { Model, Op } = require('sequelize');
const moment = require('moment');
const mqtt = require('mqtt');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models, io) {
      Notification.belongsTo(models.Sensor, {
        foreignKey: 'sensorId',
        onDelete: 'CASCADE',
        as: 'sensor',
      });
      Notification.belongsTo(models.Environment, {
        foreignKey: 'environmentId',
        onDelete: 'CASCADE',
        as: 'environment',
      });
    }

    static async findOrCreateNotification(sensor, io) {
      const notification = await Notification.findOne({
        where: {
          sensorId: sensor.id,
          createdAt: {
            [Op.gte]: moment().subtract(1, 'day').toDate()
          }
        }
      })

      if (notification) {
        return
      }

      if (sensor.max_value > sensor.current_value || sensor.min_value < sensor.current_value) {
        if (sensor.alert_notification) {
          await Notification.create({
            sensorId: sensor.id,
            environmentId: sensor.environment.id,
            value: sensor.current_value,
            maxReached: sensor.current_value > sensor.max_value,
            minReached: sensor.current_value < sensor.min_value
          })
        }
      }
    }
  }

  Notification.init({
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    maxReached: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    minReached: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isNotified: {
      type: DataTypes.BOOLEAN,
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
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
  });

  return Notification;
};
