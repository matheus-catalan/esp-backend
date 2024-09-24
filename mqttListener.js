const mqtt = require('mqtt');
const { Environment, Sensor, History, Notification } = require('./models');
require('dotenv').config();

function startMqttListener(client, io) {
  const topic = process.env.MQTT_TOPIC || '/sensors';

  client.on('connect', () => {
    console.log('Conectado ao broker MQTT');

    client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Inscrito no tópico: ${topic}`);
      } else {
        console.error(`Erro ao se inscrever no tópico: ${err.message}`);
      }
    });
  });

  client.on('message', (topic, message) => {
    let payload = message.toString();
    payload = JSON.parse(payload);
    Environment.findOne({ where: { key: payload.environment } }).then((environment) => {
      Sensor.findOne({ include: [{ model: Sensor.sequelize.models.Environment, as: 'environment' }], where: { key: payload.sensor, environmentId: environment.id } }).then(async (sensor) => {
        if (!sensor) {
          console.error('Sensor não encontrado');
          return;
        }

        // console.log("==================================================")
        // console.log(`Sensor: ${sensor.name}`);
        // console.log(`Valor: ${payload.value}`);
        // console.log(`Environment: ${environment.name}`);
        // console.log("==================================================")

        await sensor.update({ current_value: payload.value, status: payload.status });
        await History.create({ sensorId: sensor.id, value: payload.value, status: payload.status, environmentId: environment.id });
        await environment.update({ status: true, count: environment.count + 1 });
        sensor.environment = environment;
        if (!sensor.is_internal) {
          await Notification.findOrCreateNotification(sensor, io)
        }

        await io.to(`environment_${environment.key}`).emit('environmentUpdated', sensor)
        await io.to(`environment_mqtt_${environment.key}`).emit('updateMqtt', message.toString())

      }).catch((err) => {
        console.error(`Erro ao buscar sensor: ${err.message}`);
      });
    })
  });

  client.on('error', (err) => {
    console.error(`Erro na conexão MQTT: ${err.message}`);
  });
}

module.exports = startMqttListener;