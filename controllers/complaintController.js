const {
  Complaint,
  Department,
  Sector,
  Employee,
  PublicComplaint,
  ComplaintAttachment,
  Division,
  Team,
  Office,
  Admin,
} = require('../models');
const { validateLanguage, addVoiceFileUrl } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');
const { Op, where } = require('sequelize');
const Subcity = require('../models/Subcity');

// Create complaint
const createComplaint = async (req, res) => {
  try {
    const {
      complainant_name,
      phone_number,
      section,
      // province,
      employee_id,
      description,
      // desired_action,
      created_at,
      // Organizational hierarchy fields
      sector_id,
      division_id,
      department_id,
      team_id,
    } = req.body;
    const voice_note = req.file ? req.file.filename : null;

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }
    if (!phone_number || !section) {
      return res.status(400).json({
        message: 'Phone number and section are required',
      });
    }

    const complaintData = {
      complainant_name,
      phone_number,
      subcity,
      // province,
      department_id,
      employee_id: employee_id ? parseInt(employee_id) : null,
      voice_note,
      status: 'pending',
      description: description,
      // desired_action: desired_action,
      created_at: created_at ? new Date(created_at) : new Date(),
      // Organizational hierarchy fields
      sector_id: sector_id ? parseInt(sector_id) : null,
      division_id: division_id ? parseInt(division_id) : null,
      department_id: department_id ? parseInt(department_id) : null,
      team_id: team_id ? parseInt(team_id) : null,
    };

    await Complaint.create(complaintData);

    res.status(201).json({
      phone_number,
      message: 'Complaint submitted successfully',
      voice_url: voice_note ? `/uploads/voice_complaints/${voice_note}` : null,
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ message: 'Error submitting complaint', error: error.message });
  }
};

// Get complaints (public)
const getComplaints = async (req, res) => {
  try {
    const { phone_number, lang = 'en' } = req.query;

    if (!phone_number) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    const where = phone_number;
    const complaints = await Complaint.findAll({
      where,
      attributes: [
        'id',
        'complainant_name',
        'phone_number',
        'section',
        // "province",
        'department_id',
        'employee_id',
        'description',
        // 'desired_action',
        'response',
        'voice_note',
        'status',
        'created_at',
      ],
      include: [
        {
          model: Employee,
          attributes: [
            'id',
            [`first_name_${lang}`, 'first_name'],
            [`middle_name_${lang}`, 'middle_name'],
            [`last_name_${lang}`, 'last_name'],
            'office_number',
            'floor_number',
            [`position_${lang}`, 'position'],
            'department_id',
            'section',
          ],
        },
      ],
    });

    const complaintsWithUrls = complaints.map(addVoiceFileUrl);
    res.json(complaintsWithUrls);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
};

// Get complaints for admin
const getComplaintsAdmin = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const admin = req.user;

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    const currentAdmin = await Admin.findByPk(admin.id);
    let where = {};
    if (['Admin', 'Editor', 'Visitor'].includes(admin.role) && currentAdmin) {
      if (!currentAdmin.subcity_id) {
        if (currentAdmin.division_id) {
          console.log('there is a division_id');
          where.division_id = currentAdmin.division_id;
        } else {
          console.log('there is not a division_id');
          where.sector_id = currentAdmin.sector_id;
        }
      } else {
        if (currentAdmin.division_id) {
          where.division_id = currentAdmin.division_id;
        } else {
          where.subcity_id = currentAdmin.subcity_id;
        }
      }
    } else {
      console.warn('currentAdmin is null or role not allowed');
    }
    const publicComplaints = await PublicComplaint.findAll({
      where,
      include: [
        {
          model: Division,
          as: 'division',
        },
        {
          model: Department,
          as: 'department',
        },
        {
          model: Sector,
          as: 'sector',
        },

        {
          model: Subcity,
          as: 'sub_city',
        },

        {
          model: Employee,
          as: 'employee',
        },
        {
          model: Team,
          as: 'team',
        },
        {
          model: Office,
          as: 'office',
        },
        {
          model: ComplaintAttachment,
          as: 'attachment', // matches your association alias
          attributes: ['id', 'file_path', 'file_type', 'uploaded_at'],
        },
      ],

      order: [['created_at', 'DESC']],
    });
    res.status(200).json(publicComplaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
};

// Resolve complaint
const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, complaint_source, lang = 'en' } = req.body;
    const admin = req.user;
    console.log({ complaint_source, status });

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    const isPublicComplaint = complaint_source === 'public_complaint';

    const complaint = isPublicComplaint
      ? await PublicComplaint.findByPk(id)
      : await Complaint.findByPk(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (admin.role === 'Admin' && complaint.department_id !== admin.department_id) {
      return res.status(403).json({ message: 'Cannot resolve complaint from another department' });
    }

    if (admin.role === 'SubCityAdmin' && complaint.section !== admin.section) {
      return res.status(403).json({ message: 'Cannot resolve complaint from another section' });
    }

    if (isPublicComplaint) {
      await PublicComplaint.update({ status }, { where: { id } });
    } else {
      await Complaint.update({ status }, { where: { id } });
    }

    res.json({ message: 'Status has been changed successfully' });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ message: 'Error resolving complaint', error: error.message });
  }
};
module.exports = {
  createComplaint,
  getComplaints,
  getComplaintsAdmin,
  resolveComplaint,
};
