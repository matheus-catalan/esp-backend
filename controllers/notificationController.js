const { Notification } = require('../models');


exports.list = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      include: [
        { model: Notification.sequelize.models.Sensor, as: 'sensor' },
        { model: Notification.sequelize.models.Environment, as: 'environment' }
      ],

      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.delete = async (req, res) => {
  try {
    await Notification.destroy({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.deleteAll = async (req, res) => {
  try {
    await Notification.destroy({ where: {} });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.update = async (req, res) => {
  try {
    await Notification.update(req.body, { where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.updateAll = async (req, res) => {
  try {
    await Notification.update(req.body, { where: {} });
    res.status(204).end();
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}