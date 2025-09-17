const { Division } = require('../models/index.js');
const ActivityLogService = require('../services/adminLogsService');

const createDivision = async (req, res) => {
  try {
    const {
      name_en,
      name_am,
      name_af,
      appointed_person_en,
      appointed_person_af,
      appointed_person_am,
      office_number,
      sector_id,
    } = req.body;
    if (
      !name_am ||
      !name_en ||
      !name_af ||
      !appointed_person_af ||
      !appointed_person_en ||
      !appointed_person_am ||
      !office_number
    ) {
      return res.status(400).json({ message: 'Enter director name in the three languages' });
    }
    const uploadedProfilePicture = req.files?.profile_picture?.[0]?.filename;
    const divisionData = {
      name_en,
      name_am,
      name_af,
      appointed_person_en,
      appointed_person_af,
      appointed_person_am,
      office_number,
      profile_picture: uploadedProfilePicture,
      created_at: new Date(),
      updated_at: new Date(),
      sector_id,
    };
    await Division.create(divisionData);
    await ActivityLogService.logCreate(
      'Organization',
      divisionData.id,
      req.user?.id,
      divisionData.sector_id
    );
    res.status(201).json({
      message: 'Director created successfully',
    });
  } catch (error) {
    console.log('Erorr at creating division', error);
    res.status(500).json({ message: 'Error at creating division' });
  }
};
const deleteDivision = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(500).json({ message: 'Id is required to delete division' });
    }
    const division = await Division.destroy({ where: { id } });
    await ActivityLogService.logDelete(
      'Organization',
      division.id,
      req.user?.id,
      division.sector_id
    );
    res.status(200).json({ message: 'Director have been deleted successfully' });
  } catch (error) {
    console.log('Error at deleting', error);
    res.status(500).json({ message: 'Error at deleting directors' });
  }
};
const updateDivision = async (req, res) => {
  try {
    const {
      id,
      name_en,
      name_am,
      name_af,
      appointed_person_en,
      appointed_person_af,
      appointed_person_am,
      office_number,
      sector_id,
    } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Enter director name in the three languages' });
    }
    const division = await Division.findOne({ where: { id } });
    if (!division) return res.status(500).json({ message: 'Error at finding division' });
    const uploadedProfilePicture =
      req.files?.profile_picture?.[0]?.filename || division.profile_picture;

    const update = await division.update({
      name_am,
      name_en,
      name_af,
      profile_picture: uploadedProfilePicture,
      office_number,
      appointed_person_af,
      appointed_person_en,
      appointed_person_am,
      sector_id,
    });
    await ActivityLogService.logUpdate('Organization', division.id, req.user?.id, update.sector_id);
    res.status(200).json({ message: 'Director have been updated successfully' });
  } catch (error) {
    console.log('Error at updating division', error);
    res.status(500).json({ message: 'Failed to updating director' });
  }
};
module.exports = {
  createDivision,
  updateDivision,
  deleteDivision,
};
