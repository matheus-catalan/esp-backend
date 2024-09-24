'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const color = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#FF33A8",
      "#FFC300",
      "#FF33FF",
      "#33FFF1",
      "#FF8C33",
      "#8CFF33",
      "#33FF8C",
      "#3333FF",
      "#F0F0F0",
      "#D50000",
      "#00BFFF",
      "#FFD700",
      "#800080"
    ]

    const environments = await queryInterface.sequelize.query(
      'SELECT * FROM "Environments";'
    );

    for (let i = 0; i < environments[0].length; i++) {
      await queryInterface.sequelize.query(
        `UPDATE "Environments" SET "color" = '${color[i]}' WHERE id = ${environments[0][i].id};`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
