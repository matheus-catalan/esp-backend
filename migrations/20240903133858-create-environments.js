'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Environments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      light_alert: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      sound_alert: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      notification_alert: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      floor_plan_x: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      floor_plan_y: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Environments');
  }
};
