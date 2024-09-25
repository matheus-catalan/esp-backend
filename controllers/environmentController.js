const { Environment } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

exports.getAllEnvironments = async (req, res) => {
  try {
    const environments = await Environment.findAll({
      order: [
        ['id', 'ASC'],
        ['updatedAt', 'DESC']
      ], include: [{ model: Environment.sequelize.models.Sensor, as: 'sensors' }]
    });

    environments.map(environment => {
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
    })

    res.status(200).json(environments);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateEnvironment = async (req, res) => {
  const { id } = req.params;
  try {
    const environment = await Environment.findOne({ where: { id } });

    if (!environment) {
      return res.status(404).json({ message: 'Environment not found' });
    }

    await environment.update(req.body);

    req.clientMqtt.publish(`/environments/${environment.key}`, `{ alert_sound: ${environment.sound_alert} }`, (err) => {
      if (err) {
        console.error('Error publishing message:', err);
      } else {
        console.log('Message published successfully');
      }
    })

    req.clientMqtt.publish(`/environments/${environment.key}`, `{ alert_light: ${environment.light_alert} }`, (err) => {
      if (err) {
        console.error('Error publishing message:', err);
      } else {
        console.log('Message published successfully');
      }
    })

    res.status(200).json(environment);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getEnvironmentByKey = async (req, res) => {
  const { key } = req.params;

  try {
    const environment = await Environment.findOne({
      where: { key },
      include: [{ model: Environment.sequelize.models.Sensor, as: 'sensors' }]
    });

    if (environment) {
      const config = {};

      environment.sensors.forEach(sensor => {
        const key = sensor.key;

        config[`${key}_min_value`] = sensor.min_value;
        config[`${key}_max_value`] = sensor.max_value;
        config[`${key}_alert_sound`] = sensor.alert_sound;
        config[`${key}_alert_light`] = sensor.alert_light;
        config[`${key}_alert_notification`] = sensor.alert_notification;
      });
      config.light_alert = environment.light_alert;
      config.sound_alert = environment.sound_alert;

      res.status(200).json(config);
    } else {
      res.status(404).json({ message: 'Environment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getEnvironmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const environment = await Environment.findByPk(id, {
      include: [{ model: Environment.sequelize.models.Sensor, as: 'sensors' }]
    });


    if (environment) {
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

      const wifiIndex = environment.sensors.findIndex(el => el.key === 'wifi');
      const ipIndex = environment.sensors.findIndex(el => el.key === 'ip');

      if (wifiIndex !== -1 && ipIndex !== -1) {
        environment.sensors[wifiIndex].current_value = `${environment.sensors[wifiIndex].current_value} - ${environment.sensors[ipIndex].current_value}`;
        environment.sensors.splice(ipIndex, 1);
      }

      res.status(200).json(environment);
    } else {
      res.status(404).json({ message: 'Environment not found' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.pingEnvironment = async (req, res) => {
  // const { key } = req.params;
  // try {
  //   const environment = await Environment.findOne({
  //     where: { key },
  //     include: [{ model: Environment.sequelize.models.Sensor, as: 'sensors' }]
  //   });

  //   if (!environment) {
  //     return res.status(404).json({ error: 'Environment not found' });
  //   }

  //   console.log("================================ping_to_server==================================")
  //   console.log("environment", environment.name)
  //   console.log("================================ping_to_server==================================")

  //   environment.sensors = environment.sensors.sort((a, b) => {
  //     const _a = (a.key === 'presence' || a.key === 'wifi') ? 0 : 1;
  //     const _b = (b.key === 'presence' || b.key === 'wifi') ? 0 : 1;

  //     if (_a !== _b) {
  //       return _b - _a;
  //     } else {
  //       return a.id - b.id;
  //     }
  //   });

  //   environment.update({ updatedAt: null, status: true });
  //   req.io.to(`environment_${ environment.key }`).emit('environmentUpdated', environment);
  //   res.status(200).json(environment);
  // } catch (error) {
  //   console.log("================================error_server==================================")
  //   console.log(error)
  //   console.log("================================error_server==================================")
  //   res.status(500).json({ error: 'An error occurred while updating the environment' });
  // }
}

exports.update = async (req, res) => {
  try {
    const environment = await Environment.findByPk(req.params.id);

    if (!environment) {
      return res.status(404).json({ message: 'Environment not found' });
    }
    await environment.update(req.body);
    req.io.emit('environmentUpdated', environment);

    res.status(200).json(environment);
  } catch (error) {
    res.status(400).json({ message: 'Bad request' });
  }
};

exports.getEnvironmentHistories = async (req, res) => {
  const { id } = req.params;
  try {

    const environment = await Environment.findByPk(id, {
      include: [
        {
          model: Environment.sequelize.models.History,
          as: 'histories',
          include: [{ model: Environment.sequelize.models.Sensor, as: 'sensor', }],
          where: {
            createdAt: {
              [Op.gt]: moment().subtract(1, 'day').toDate()
            },
          },
          limit: 100,
          order: [['createdAt', 'DESC']]
        }
      ]
    });


    if (environment) {
      res.status(200).json(environment.histories);
    } else {
      res.status(404).json({ message: 'Environment not found' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
}