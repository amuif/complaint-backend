const { Sector } = require('../models');
const ActivityLogService = require('../services/adminLogsService');
const createSector = async (req, res) => {
  try {
    const {
      name_en,
      name_am,
      name_af,
      appointed_person_en,
      appointed_person_af,
      appointed_person_am,
      office_number,
    } = req.body;
    if (
      !name_am ||
      !name_en ||
      !name_af ||
      !appointed_person_af ||
      !appointed_person_en ||
      !appointed_person_am 
    ) {
      return res.status(400).json({ message: 'Enter sector name in the three languages' });
    }
    const uploadedProfilePicture = req.files?.profile_picture?.[0]?.filename;

    const sectorData = {
      name_en,
      name_am,
      name_af,
      appointed_person_en,
      appointed_person_af,
      appointed_person_am,
      office_number,
      profile_picture: uploadedProfilePicture,
      created_at: new Date(),
    };
    const sector = await Sector.create(sectorData);
    await ActivityLogService.logCreate('Organization', sector.id, req.user?.id);
    res.status(201).json({
      message: 'Sector created successfully',
    });
  } catch (error) {
    console.log('Error at creating sector', error);
    res.status(500).json({
      message: 'Failed to create new sector',
    });
  }
};
const deleteSector = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.body;
    const desiredSector = await Sector.findOne({ where: { id } });
    if (!desiredSector) {
      return res.status(500).json({ message: "Coudn't find desired sector" });
    }

    await Sector.destroy({ where: { id } });
    await ActivityLogService.logDelete('Organization', desiredSector.id, req.user?.id);
    res.status(202).json({ message: 'Sector deleted successfully' });
  } catch (error) {
    console.log('Error at deleting sector', error);
    res.status(500).json({ message: 'Error at deleting sector' });
  }
};
const updateSector = async (req, res) => {
  try {
    const {
      id,
      name_af,
      name_en,
      name_am,
      appointed_person_am,
      appointed_person_en,
      appointed_person_af,
      office_number,
    } = req.body;
    if (!id) {
      console.log('id is not found');
      return res.status(500).json({ message: 'id is neccessay for updating sector' });
    }
    const sector = await Sector.findOne({ where: { id } });
    if (!sector) {
      return res.status(404).json({ message: 'Sector not found' });
    }

    const uploadedProfilePicture =
      req.files?.profile_picture?.[0]?.filename || sector.profile_picture;
    await Sector.update(
      {
        name_am,
        name_en,
        name_af,
        profile_picture: uploadedProfilePicture,
        office_number,
        appointed_person_af,
        appointed_person_en,
        appointed_person_am,
      },
      { where: { id } }
    );
    await ActivityLogService.logUpdate('Organization', sector.id, req.user?.id);
    res.status(200).json({ message: 'updated successfully' });
  } catch (error) {
    console.log('Error at updating sector', error);
    res.status(500).json({ message: 'Error at updating sector' });
  }
};

module.exports = {
  createSector,
  updateSector,
  deleteSector,
};
