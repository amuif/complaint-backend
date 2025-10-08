const { Department } = require('../models/index.js');
const ActivityLogService = require('../services/adminLogsService');

const createDepartment = async (req, res) => {
  try {
    const {
      name_en,
      name_am,
      name_af,
      appointed_person_en,
      appointed_person_af,
      appointed_person_am,
      office_location_en,
      office_location_af,
      office_location_am,
      subcity_id,
      sector_id,
      division_id,
    } = req.body;
    if (
      !name_am ||
      !name_en ||
      !name_af ||
      !appointed_person_af ||
      !appointed_person_en ||
      !appointed_person_am ||
      !office_location_en ||
      !office_location_af ||
      !office_location_am
    ) {
      return res.status(400).json({ message: 'Enter team name in the three languages' });
    }

    const uploadedProfilePicture = req.files?.profile_picture?.[0]?.filename;
    const departmentData = {
      name_en,
      name_am,
      name_af,
      appointed_person_en,
      appointed_person_af,
      appointed_person_am,
      office_location_en,
      office_location_af,
      office_location_am,
      subcity_id,
      profile_picture: uploadedProfilePicture,
      sector_id,
      division_id,
    };
    await Department.create(departmentData);
    await ActivityLogService.logCreate(
      'Organization',
      departmentData.id,
      req.user?.id,
      departmentData.sector_id
    );
    res.status(201).json({
      message: 'team created successfully',
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      message: 'Failed to create department',
    });
  }
};
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(500).json({ message: 'ID is required' });
    const department = await Department.destroy({ where: { id } });
    await ActivityLogService.logDelete(
      'Organization',
      department.id,
      req.user?.id,
      department.sector_id
    );
    res.status(200).json({ message: 'successfully deleted team' });
  } catch (error) {
    console.log('Error at deleting team', error);
    res.status(500).json({ message: 'Error at deleting team' });
  }
};
const updateDepartment = async (req, res) => {
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
      division_id,
    } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Enter team name in the three languages' });
    }
    const department = await Department.findOne({ where: { id } });
    const uploadedProfilePicture =
      req.files?.profile_picture?.[0]?.filename || department.profile_picture;

    const updated = await department.update({
      name_am,
      name_en,
      name_af,
      profile_picture: uploadedProfilePicture,
      office_number,
      appointed_person_af,
      appointed_person_en,
      appointed_person_am,
      sector_id,
      division_id,
    });
    await ActivityLogService.logUpdate('Organization', updated.id, req.user?.id, updated.sector_id);
    res.status(200).json({ message: 'successfully updated team' });
  } catch (error) {
    console.log('Error at updating teams', error);
    res.status(500).json({ message: 'Error at updating teams' });
  }
};
module.exports = {
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
