const { History } = require('../models');
const { Environment } = require('../models');
const { Sensor } = require('../models');
const moment = require('moment');
const _ = require('lodash');
const { Op } = require('sequelize');

exports.getAllEnvironments = async (req, res) => {
  try {
    const environments = await History.findAll();
    res.status(200).json(environments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const granularities = {
  'second': 'YYYY-MM-DD HH:mm:ss',
  'minute': 'YYYY-MM-DD HH:mm',
  'hour': 'YYYY-MM-DD HH',
  'day': 'YYYY-MM-DD',
  'week': 'YYYY-ww',
  'month': 'YYYY-MM',
  'year': 'YYYY'
}

const granularitiesLimit = {
  'second': 30,
  'minute': 30,
  'hour': 24,
  'day': 10000,
  'week': 52,
  'month': 1000,
  'year': 10000
}

const _granularities = {
  'second': { format: 'YYYY-MM-DD HH:mm:ss', unit: 'second' },
  'minute': { format: 'YYYY-MM-DD HH:mm', unit: 'minute' },
  'hour': { format: 'YYYY-MM-DD HH', unit: 'hour' },
  'day': { format: 'YYYY-MM-DD', unit: 'day' },
  'week': { format: 'YYYY-ww', unit: 'week' },
  'month': { format: 'YYYY-MM', unit: 'month' },
  'year': { format: 'YYYY', unit: 'year' }
};

const sensorsConfig = {
  temperature: {
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.9)',
    // yAxisID: 'temperature',
    // label: 'Temperature',
  },
  humidity: {
    borderColor: 'rgb(54, 162, 235)',
    backgroundColor: 'rgba(54, 162, 235, 0.9)',
  },
  noise: {
    borderColor: 'rgb(75, 192, 192)',
    backgroundColor: 'rgba(75, 192, 192, 0.9)',
    yAxisID: 'noise',
    label: 'Noise',
  },
  ldr: {
    borderColor: 'rgb(255, 205, 86)',
    backgroundColor: 'rgba(255, 205, 86, 0.9)',
    yAxisID: 'ldr',
    label: 'luminosidade',
  },
  mq2: {
    borderColor: 'rgb(153, 102, 255)',
    backgroundColor: 'rgba(153, 102, 255, 0.9)',
    yAxisID: 'mq2',
    label: 'MQ2',
  },
  presence: {
    borderColor: 'rgb(255, 159, 64)',
    backgroundColor: 'rgba(255, 159, 64, 0.9)',
    yAxisID: 'presence',
    label: 'Presence',
  },
}

exports.getHistoryByEnvironmentAndSensor = async (req, res) => {
  const { granularity } = req.params;
  const { environmentId } = req.params;
  const { sensorKey } = req.params;

  try {
    const labels = [];
    const now = moment();  // Momento atual

    for (let i = 0; i < 50; i++) {
      const label = moment(now).subtract(i, _granularities[granularity].unit).format(_granularities[granularity].format);
      labels.push(label);
    }

    const sensor = await Sensor.findOne({ where: { key: sensorKey, environmentId }, include: [{ model: Sensor.sequelize.models.Environment, as: 'environment' }] });
    const histories = await History.findAll({
      where: {
        sensorId: sensor.id,
        createdAt: {
          [Op.gte]: moment(now).subtract(50, _granularities[granularity].unit).toDate(),
        },
      },
      order: [['createdAt', 'ASC']],
    });


    const groupedByGranularity = _.groupBy(histories, history => {
      return moment(history.createdAt).format(_granularities[granularity].format);
    });


    const datas = labels.map(label => {
      let records = groupedByGranularity[label] || [];

      if (sensor.key === 'presence') {
        return records[0] ? records[0].value : null;
      } else if (granularity === 'second') {
        // Para granularidade 'second', usar valor direto
        return records[0] ? records[0].value : null;
      } else {
        // Para granularidades maiores, calcular a média dos valores
        const sum = _.sumBy(records, record => parseFloat(record.value));

        return records.length > 0 ? (sum / records.length).toFixed(2) : null;
      }
    });

    let data_ = fillArray(datas);

    res.status(200).json({
      labels,
      dataset: {
        label: sensor.environment.name,
        data: data_,
        cubicInterpolationMode: 'monotone',
        spanGaps: true,
        backgroundColor: sensor.environment.color,
        borderColor: sensor.environment.color,
      }
    });
  } catch (error) {
    console.error('Error fetching environment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const isValidValue = (value) => {
  return value !== null && value !== undefined && !isNaN(value);
};

const getNearestValue = (array, currentIndex) => {
  let previousIndex = currentIndex - 1;
  let nextIndex = currentIndex + 1;

  while (previousIndex >= 0 || nextIndex < array.length) {
    // Verifica o valor anterior válido
    if (previousIndex >= 0 && isValidValue(array[previousIndex])) {
      return array[previousIndex];
    }

    // Verifica o valor seguinte válido
    if (nextIndex < array.length && isValidValue(array[nextIndex])) {
      return array[nextIndex];
    }

    previousIndex--;
    nextIndex++;
  }

  return null; // Se nenhum valor válido for encontrado
};

const fillArray = (array) => {
  for (let i = 0; i < array.length; i++) {
    if (!isValidValue(array[i])) {
      array[i] = getNearestValue(array, i);
    }
  }
  return array;
};


exports.getHistoryByEnvironmentAndSensora = async (req, res) => {
  const { id, sensor_key, granularity } = req.params;

  try {
    const sensor = await Sensor.findOne({ where: { key: sensor_key, environmentId: id } });

    let histories = await History.findAll({
      where: { sensorId: sensor.id },
      order: [['createdAt', 'DESC']],
      limit: granularitiesLimit[granularity],
    });

    histories = _.reverse(histories);

    histories = histories.map(history => ({
      createdAt: moment(history.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      value: parseFloat(history.value),
    }));

    const groupedByGranularity = _.groupBy(histories, history => {
      return moment(history.createdAt).format(granularities[granularity]);
    });

    let dataset = {
      labels: [],
      datasets: [],
    };

    const datas = Array.from(Object.keys(groupedByGranularity)).map(label => {
      const records = groupedByGranularity[label];
      if (sensor.key === 'presence') {
        return records[0] ? records[0].value : null;
      } else {
        const sum = _.sumBy(records, 'value');
        return (sum / records.length).toFixed(2);
      }
    });

    dataset.labels = Array.from(Object.keys(groupedByGranularity));

    dataset.datasets.push({
      label: sensor.key.charAt(0).toUpperCase() + sensor.key.slice(1),
      data: datas,
      ...sensorsConfig[sensor.key],
    });

    res.status(200).json(dataset);
  } catch (error) {
    console.log("================================================================================================================================================================")
    console.error('Error fetching environment:', error);
    console.log("================================================================================================================================================================")
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getHistoryBySensor = async (req, res) => {
  const histories = await History.findAll({
    where: { sensorId: req.params.id },
    order: [['createdAt', 'DESC']],
    limit: 100,
  });

  res.status(200).json(histories);
}

