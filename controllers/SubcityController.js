const { Subcity } = require('../models');
const ActivityLogService = require('../services/adminLogsService');
const createSubcity = async (req, res) => {
  try {
    const {
      name_en,
      name_am,
      name_af,
      appointed_person_en,
      appointed_person_af,
      appointed_person_am,
      office_location_en,
      office_location_am,
      office_location_af,
    } = req.body;
    if (
      !name_am ||
      !name_en ||
      !name_af ||
      !appointed_person_af ||
      !appointed_person_en ||
      !appointed_person_am ||
      !office_location_en ||
      !office_location_am ||
      !office_location_af
    ) {
      return res.status(400).json({ message: 'Enter sector name in the three languages' });
    }

    const subcityData = {
      name_en,
      name_am,
      name_af,
      appointed_person_en,
      appointed_person_af,
      appointed_person_am,
      office_location_en,
      office_location_am,
      office_location_af,
      created_at: new Date(),
    };
    const newSubcity = await Subcity.create(subcityData);
    await ActivityLogService.logCreate('subcity', newSubcity.id, req.user?.id);

    res.status(201).json({
      message: 'Subcity created successfully',
    });
  } catch (error) {
    console.log('Error at creating sector', error);
    res.status(500).json({
      message: 'Failed to create new sector',
    });
  }
};
const deleteSubcity = async (req, res) => {
  try {
    console.log(req.query);
    const { id } = req.query;
    const desiredSector = await Subcity.findOne({ where: { id } });
    if (!desiredSector) {
      return res.status(500).json({ message: "Coudn't find desired sector" });
    }

    const subcity = await Subcity.destroy({ where: { id } });
    await ActivityLogService.logDelete('subcity', subcity.id, req.user?.id);
    res.status(202).json({ message: 'Subcity deleted successfully' });
  } catch (error) {
    console.log('Error at deleting sector', error);
    res.status(500).json({ message: 'Error at deleting Subcity' });
  }
};
const updateSubcity = async (req, res) => {
  try {
    const {
      id,
      name_af,
      name_en,
      name_am,
      appointed_person_am,
      appointed_person_en,
      appointed_person_af,
      office_location_en,
      office_location_am,
      office_location_af,
    } = req.body;
    console.log(req.body);
    if (!id) {
      console.log('id is not found');
      return res.status(500).json({ message: 'id is neccessay for updating sector' });
    }
    const subcity = await Subcity.findOne({ where: { id } });
    if (!subcity) {
      return res.status(404).json({ message: 'subcity not found' });
    }

    await Subcity.update(
      {
        name_am,
        name_en,
        name_af,
        appointed_person_af,
        appointed_person_en,
        appointed_person_am,
        office_location_en,
        office_location_am,
        office_location_af,
      },
      { where: { id } }
    );
    await ActivityLogService.logUpdate('subcity', subcity.id, req.user?.id);
    res.status(200).json({ message: 'updated successfully' });
  } catch (error) {
    console.log('Error at updating subcity', error);
    res.status(500).json({ message: 'Error at updating subcity' });
  }
};

module.exports = {
  createSubcity,
  updateSubcity,
  deleteSubcity,
};
