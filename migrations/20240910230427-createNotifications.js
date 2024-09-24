'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      value: {
        type: Sequelize.STRING
      },
      maxReached: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      minReached: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isNotified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      environmentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Environments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sensorId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Sensors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
  }
};
