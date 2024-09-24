const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const mqtt = require('mqtt');
require('dotenv').config();
const { Op } = require('sequelize');

const socketIo = require('socket.io');
const port = 8000;
const startMqttListener = require('./mqttListener');
const brokerUrl = process.env.MQTT_URL || 'mqtt://localhost:1883';
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const clientMqtt = mqtt.connect(brokerUrl);

const environmentController = require('./controllers/environmentController');
const sensorController = require('./controllers/sensorController');
const historyController = require('./controllers/historyController');
const notificationController = require('./controllers/notificationController');
const { Environment, History, Sensor } = require('./models');

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use((req, res, next) => {
  req.io = io;
  req.clientMqtt = clientMqtt;
  next();
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinEnvironment', (environmentId) => {
    socket.join(`environment_${environmentId}`);
  });

  socket.on('joinEnvironmentMqtt', (environmentId) => {
    socket.join(`environment_mqtt_${environmentId}`);
    console.log(`Socket ${socket.id} joined environment_mqtt_${environmentId}`);
  });

  socket.on('joinNotification', () => {
    socket.join(`notifications`);
    console.log(`Socket ${socket.id} joined notifications`);
  });

  socket.on('joinSensor', (sensorId) => {
    socket.join(`sensor_${sensorId}`);
    console.log(`Socket ${socket.id} joined sensor_${sensorId}`);
  });



  socket.on('updateEnvironment', (environmentId, environmentData) => {
    io.to(`environment_${environmentId}`).emit('environmentUpdated', environmentData);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

startMqttListener(clientMqtt, io);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/environments', environmentController.getAllEnvironments);
app.get('/environments/:key/ping', environmentController.pingEnvironment);
app.get('/environments/by_key/:key', environmentController.getEnvironmentByKey);
app.get('/environments/:id', environmentController.getEnvironmentById);
app.put('/environments/:id', environmentController.updateEnvironment);
app.get('/environments/:id/histories', environmentController.getEnvironmentHistories);

app.get('/sensors', sensorController.list);
app.post('/sensors', sensorController.create);
app.put('/sensors/:id', sensorController.update);
app.get('/sensors/:id', sensorController.getSensorById);
app.get('/sensors/:id/histories', sensorController.getSensorHistoriesById);
app.get('/sensors_test/:sensor_key', sensorController.test);

app.get('/histories/:id', historyController.getHistoryBySensor);
app.get('/histories', historyController.getAllEnvironments);
// app.get('/histories/environments/:id/:sensor_key/:granularity', historyController.getHistoryByEnvironmentAndSensor);
app.get('/histories/environments/:environmentId/:sensorKey/:granularity', historyController.getHistoryByEnvironmentAndSensor);

app.get('/notifications', notificationController.list);
app.delete('/notifications/:id', notificationController.delete);
app.delete('/notifications', notificationController.deleteAll);
app.put('/notifications/:id', notificationController.update);
app.put('/notifications', notificationController.updateAll);



app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});

server.listen(port + 1, '0.0.0.0', () => {
  console.log(`Socket is running on http://0.0.0.0:${port + 1}`);
});

async function updateRandomSensor() {
  try {
    const environment = await Environment.findOne({ where: { key: { [Op.notIn]: ['caldeira', 'producao'] } }, include: [{ model: Environment.sequelize.models.Sensor, as: 'sensors' }] });
    const sensor = await Sensor.findOne({ where: { environmentId: environment.id, is_internal: false, key: { [Op.notIn]: ['presence'] } } });
    const otherEnvironment = await Environment.findOne({
      where: {
        key: { [Op.in]: ['caldeira', 'producao'] }
      },
      include: [
        {
          model: Environment.sequelize.models.Sensor,
          as: 'sensors'
        }
      ]
    });

    const otherSensor = otherEnvironment.sensors.find(s => s.key === sensor.key && s.id !== sensor.id);
    await sensor.update({ current_value: parseInt(otherSensor.current_value) + 1, status: true });
    await History.create({ sensorId: sensor.id, value: parseInt(otherSensor.current_value) + 1, status: true, environmentId: environment.id });
    await environment.update({ status: true, count: environment.count + 1 });

    const sensorsArray = environment.sensors;
    environment.sensors = sensorsArray.sort((a, b) => {
      const _a = (a.key === 'presence' || a.key === 'wifi') ? 0 : 1;
      const _b = (b.key === 'presence' || b.key === 'wifi') ? 0 : 1;

      if (_a !== _b) {
        return _b - _a;
      } else {
        return a.id - b.id;
      }
    });
    await io.to(`environment_${environment.key}`).emit('environmentUpdated', environment);

  } catch (error) {
    console.error('Error updating random environment:', error);
  }
}

async function updateStatusEnvironments() {
  try {
    const environments = await Environment.findAll();

    environments.forEach(async (environment) => {
      if (environment.status == false)
        return

      const currentDate = new Date();
      const differenceInSeconds = (currentDate - environment.updatedAt) / 1000;
      if (differenceInSeconds > 10) {
        environment.update({ status: false })
      }


      await io.to(`environment_${environment.key}`).emit('environmentUpdated', environment);
    });
  } catch (error) {
    console.error('Error updating environments status:', error);
  }
}

// setInterval(updateStatusEnvironments, 1000 * 60);
setInterval(updateRandomSensor, 1000);

