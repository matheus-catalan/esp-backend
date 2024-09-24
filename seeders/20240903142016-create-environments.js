'use strict';
const { Environment } = require('../models'); // Certifique-se de importar o modelo Sensor

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const environmentData = [
      {
        name: 'Produção',
        key: 'producao',
        icon: 'mdi-factory',
        floor_plan_x: 480,
        floor_plan_y: 70,
        light_alert: true,
        sound_alert: true,
        notification_alert: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Caldeira',
        key: 'caldeira',
        icon: 'mdi-fire',
        floor_plan_x: 860,
        floor_plan_y: 655,
        light_alert: true,
        sound_alert: true,
        notification_alert: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Caldeira',
        key: 'caldeira',
        icon: 'mdi-package',
        floor_plan_x: 865,
        floor_plan_y: 90,
        light_alert: true,
        sound_alert: true,
        notification_alert: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 190,
        floor_plan_y: 50,
        name: 'CPD',
        icon: 'mdi-map-marker',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'cpd',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 30,
        floor_plan_y: 47,
        name: 'Admin',
        icon: 'mdi-briefcase',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 30,
        floor_plan_y: 220,
        name: 'Embalagem Secundário',
        icon: 'mdi-cube',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'embalagem_secundario',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 20,
        floor_plan_y: 340,
        name: 'Recepção de Matéria-pr.',
        icon: 'mdi-palette',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'recepcao_de_materia_prima',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 20,
        floor_plan_y: 560,
        name: 'Recepção',
        icon: 'mdi-account-check',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'recepcao',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 360,
        floor_plan_y: 220,
        name: 'Almoxarifado Embalagens',
        icon: 'mdi-package',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'almoxarifado_embalagens',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 500,
        floor_plan_y: 320,
        name: 'Amostragem',
        icon: 'mdi-package-variant-closed',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'amostragem',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 390,
        floor_plan_y: 445,
        name: 'Lab. controle de qualidade',
        icon: 'mdi-flask',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'lab_controle_de_qualidade',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 290,
        floor_plan_y: 650,
        name: 'Expedição',
        icon: 'mdi-truck-delivery',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'expedicao',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 490,
        floor_plan_y: 660,
        name: 'Produção de semi-sólidos',
        icon: 'mdi-beaker',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'producao_de_semi_solidos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 850,
        floor_plan_y: 475,
        name: 'Triturador',
        icon: 'mdi-blender',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'triturador',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 810,
        floor_plan_y: 320,
        name: 'Refeitório',
        icon: 'mdi-food',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'refeitorio',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 945,
        floor_plan_y: 320,
        name: 'Vestiário',
        icon: 'mdi-locker',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'vestiario',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        floor_plan_x: 335,
        floor_plan_y: 340,
        name: 'Pesagem',
        icon: 'mdi-scale-bathroom',
        light_alert: false,
        sound_alert: false,
        notification_alert: false,
        key: 'pesagem',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];


    for (const _environment of environmentData) {
      let environment = await Environment.findOne({ where: { key: _environment.key } });

      if (!environment) {
        await Environment.create(_environment);
      } else {
        await environment.update(_environment);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Environments', null, {});
  }
};
