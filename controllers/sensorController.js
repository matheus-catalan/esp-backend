const { Sensor } = require('../models');
const { Environment, History } = require('../models');
const { Notification } = require('../models');
const axios = require('axios');
const { Op } = require('sequelize');
const _ = require('lodash');
const moment = require('moment');


exports.list = async (req, res) => {
  try {
    //const sensors = await Sensor.findAll({
    //  include: [{ model: Sensor.sequelize.models.Environment, as: 'environment' }],
    //});

    const notification = await Notification.findOne({
      where: {
        sensorId: 1,
        createdAt: {
          [Op.gte]: moment().subtract(1, 'day').toDate()
        }
      }
    })
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const sensor = await Sensor.create(req.body);
    res.status(201).json(sensor);
  } catch (error) {
    console.error('Error creating sensor:', error);
    res.status(400).json({ message: 'Bad request' });
  }
};

exports.getSensorById = async (req, res) => {
  const { id } = req.params;
  try {
    const sensor = await Sensor.findByPk(id, {
      include: [
        {
          model: Environment.sequelize.models.History,
          as: 'histories',
          where: {
            createdAt: {
              [Op.gt]: moment().subtract(1, 'day').toDate()
            },
          },
          limit: 30,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }

    res.status(200).json(sensor);
  } catch (error) {
    console.error('Error fetching sensor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.update = async (req, res) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id, { include: [{ model: Sensor.sequelize.models.Environment, as: 'environment' }] });

    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }

    const oldSensorData = sensor.toJSON();

    await sensor.update(req.body);

    const newSensorData = await Sensor.findByPk(req.params.id, { include: [{ model: Sensor.sequelize.models.Environment, as: 'environment' }] });
    const changes = {};
    Object.keys(req.body).forEach(key => {
      if (key === 'current_value' || key === 'status' || key === 'updatedAt' || key === 'createdAt') {
        return;
      }
      let oldData = key.includes('_value') ? parseFloat(oldSensorData[key]) : !!oldSensorData[key];
      let newData = key.includes('_value') ? parseFloat(req.body[key]) : !!req.body[key];
      let _key = key.includes('_value') ? key.replace('_value', '') : key;


      if (oldData !== newData) {
        changes[`${newSensorData.key}_${_key}`] = newData;
      }
    });
    for (const [field, value] of Object.entries(changes)) {
      const message = JSON.stringify({ [field]: value });
      req.clientMqtt.publish(`/environments/${newSensorData.environment.key}`, message, (err) => {
        if (err) {
          console.error('Error publishing message:', err);
        } else {
          console.log('Message published successfully');
        }
      });
    }

    Notification.findOrCreateNotification(sensor, req.io);

    res.status(200).json(sensor);
  } catch (error) {
    res.status(400).json({ message: 'Bad request' });
  }
};



exports.getSensorHistoriesById = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  try {
    const sensor = await Sensor.findOne({ where: { id: id }, });

    sensor.histories = await History.findAll({
      where: {
        sensorId: id
      },
      limit: 100,
      order: [['createdAt', 'DESC']]
    })

    if (sensor) {
      res.status(200).json({ datasets: getDatesets(sensor, sensor.key) });
    } else {
      res.status(404).json({ message: 'Sensor not found' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
}

const getDatesets = (sensor, key) => {
  const sensorsConfig = {
    temperature: {
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.9)',
      yAxisID: 'temperature',
      label: 'Temperature',
      tension: 0.1,
      pointRadius: 1.5,
    },
    humidity: {
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.9)',
      yAxisID: 'humidity',
      label: 'Humidity',
      tension: 0.1,
      pointRadius: 1.5,
    },
    noise: {
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.9)',
      yAxisID: 'noise',
      label: 'Noise',
      tension: 0.1,
      pointRadius: 1.5,
    },
    ldr: {
      borderColor: 'rgb(255, 205, 86)',
      backgroundColor: 'rgba(255, 205, 86, 0.9)',
      yAxisID: 'ldr',
      label: 'luminosidade',
      tension: 0.1,
      pointRadius: 1.5,
    },
    mq2: {
      borderColor: 'rgb(153, 102, 255)',
      backgroundColor: 'rgba(153, 102, 255, 0.9)',
      yAxisID: 'mq2',
      label: 'MQ2',
      tension: 0.1,
      pointRadius: 1.5,
    },
    presence: {
      borderColor: 'rgb(255, 159, 64)',
      backgroundColor: 'rgba(255, 159, 64, 0.9)',
      yAxisID: 'presence',
      label: 'Presence',
      tension: 0.1,
      pointRadius: 1.5,
    },
  }
  let dataset = {
    labels: [],
    datasets: [
      { data: [], ...sensorsConfig[key] }
    ]
  }

  if (sensor.histories === undefined || sensor.histories.length === 0) {
    return dataset;
  }

  let data = sensor.histories.map(history => {
    const date = moment(history.createdAt).utcOffset('-03:00');

    return {
      key: sensor.key,
      value: parseFloat(history.value),
      second: date.format('DD-MM HH:mm:ss')
    }
  })
  data = _.reverse(data);

  data = _.takeRight(data, 100);
  dataset.labels = _.uniq(data.map(d => d.second));
  dataset.datasets[0].data = data.map(d => d.value);


  return {
    ...dataset,
  }
};

function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);

  return values.map(value => {
    return (value - min) / (max - min);
  });
}

exports.test = async (req, res) => {
  try {
    let sensor_ids = await Sensor.findAll({
      where: {
        environmentId: { [Op.notIn]: [1, 2] }
      }
    });

    sensor_ids = sensor_ids.map(sensor => sensor.id);

    let histories = await History.findAll({
      where: {
        sensorId: sensor_ids,
      }
    })

    histories.forEach(async history => {
      history.value = parseFloat(history.value) + (Math.random() * (1 - 0.1) + 0.1).toFixed(1);
      await history.save();
    })


    res.status(200).json(histories);


  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}