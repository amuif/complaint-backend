const { ActivityLog, Admin, Subcity, Sector, PublicRating, PublicComplaint } = require('../models');

const getNotifications = async (req, res) => {
  try {
    const admin = req.user;
    const currentAdmin = await Admin.findByPk(admin.id);
    const where = {};

    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    const logs = await ActivityLog.findAll({
      where: where,
      attributes: [
        'id',
        'admin_id',
        'action',
        'entity_type',
        'entity_id',
        'details',
        'sector_id',
        'subcity_id',
        'created_at',
      ],
      include: [
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'username'],
        },
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name_en', 'name_am', 'name_af'], // Only select needed fields
        },
        {
          model: Subcity,
          as: 'subcity',
          attributes: ['id', 'name_en', 'name_am', 'name_af'], // Only select needed fields
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};

module.exports = { getNotifications };
