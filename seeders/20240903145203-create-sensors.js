'use strict';
const { Environment, Sensor } = require('../models'); // Certifique-se de importar o modelo Sensor

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const environments = await Environment.findAll();

    const sensorData = [
      {
        key: 'humidity',
        name: 'Umidade',
        status: false,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: '%',
        icon: 'mdi-water',
        min_value: 10,
        max_value: 90,
        is_internal: false
      },
      {
        key: 'temperature',
        name: 'Temperatura',
        status: false,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: '°C',
        icon: 'mdi-thermometer',
        min_value: 10,
        max_value: 30,
        is_internal: false
      },
      {
        key: 'mq2',
        name: 'Gases',
        status: false,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: 'ppm',
        icon: 'mdi-gas-burner',
        min_value: 200,
        max_value: 500,
        is_internal: false
      },
      {
        key: 'ldr',
        name: 'Luminosidade',
        status: true,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: 'lux',
        icon: 'mdi-brightness-6',
        min_value: 200,
        max_value: 500,
        is_internal: false
      },
      {
        key: 'noise',
        name: 'Ruído',
        status: true,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: 'dB',
        icon: 'mdi-home-sound-in-outline',
        min_value: 200,
        max_value: 500,
        is_internal: false
      },
      {
        key: 'presence',
        name: 'Presença',
        status: true,
        current_value: false,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: '',
        icon: 'mdi-run-fast',
        min_value: 0,
        max_value: 1,
        is_internal: false
      },
      {
        key: 'wifi',
        name: 'Wifi',
        status: true,
        current_value: false,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: '',
        icon: 'mdi-wifi',
        min_value: 0,
        max_value: 1,
        is_internal: true
      },
      {
        key: 'memory',
        name: 'Memoria',
        status: true,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: '%',
        icon: 'mdi-memory',
        min_value: 0,
        max_value: 1,
        is_internal: true
      },
      {
        key: 'cpu',
        name: 'Cpu usado',
        status: true,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: '%',
        icon: 'mdi-cpu-32-bit',
        min_value: 0,
        max_value: 1,
        is_internal: true
      },
      {
        key: 'uptime',
        name: 'Tempo ligado',
        status: true,
        current_value: '0',
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: '',
        icon: 'mdi-cpu-32-bit',
        min_value: 0,
        max_value: 1,
        is_internal: true
      },
      {
        key: 'temp_internal',
        name: 'Temperatura interna',
        status: true,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: '°C',
        icon: 'mdi-thermometer',
        min_value: 0,
        max_value: 1,
        is_internal: true
      },
      {
        key: 'voltage',
        name: 'Voltagem',
        status: true,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: 'V',
        icon: 'mdi-flash-triangle-outline',
        min_value: 0,
        max_value: 1,
        is_internal: true
      },
      {
        key: 'ip',
        name: 'IP',
        status: true,
        current_value: 0,
        alert_light: true,
        alert_sound: true,
        alert_notification: true,
        unit: 'V',
        icon: 'mdi-flash-triangle-outline',
        min_value: 0,
        max_value: 1,
        is_internal: true
      },


    ];

    for (const env of environments) {
      for (const _sensor of sensorData) {
        let sensor = await Sensor.findOne({ where: { environmentId: env.id, key: _sensor.key } });

        if (!sensor) {
          await Sensor.create({ ..._sensor, environmentId: env.id });
        } else {
          await sensor.update(_sensor);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Sensors', null, {});
  }
};
