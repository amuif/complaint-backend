const {
  Admin,
  Employee,
  Complaint,
  Rating,
  Feedback,
  PasswordReset,
  PublicComplaint,
  PublicFeedback,
  PublicRating,
  Department,
  Office,
  Sector,
  Division,
  Subcity,
} = require('../models');

const { validateLanguage, getSentiment } = require('../utils/helpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const ActivityLogService = require('../services/adminLogsService');
// Add profile picture URL helper
const addProfilePictureUrl = (entity) => {
  const plainEntity = entity.get
    ? entity.get({ plain: true })
    : entity.toJSON
      ? entity.toJSON()
      : entity;
  return {
    ...plainEntity,
    profile_picture: entity.profile_picture
      ? `/Uploads/profile_pictures/${entity.profile_picture}`
      : null,
  };
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        city: admin.city,
        subcity: admin.subcity_id,
        section: admin.subcity, // Keep for backward compatibility
        department: admin.department,
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    const adminInfo = addProfilePictureUrl(admin);
    res.json({
      message: 'Login successful',
      token,
      admin: adminInfo,
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

const getAdmins = async (req, res) => {
  let whereCondition = {};
  try {
    const admins = await Admin.findAll({
      where: whereCondition,
      include: [
        {
          model: Sector,
          as: 'sector',
        },
        {
          model: Department,
          as: 'department',
        },
        {
          model: Division,
          as: 'division',
        },
        {
          model: Subcity,
          as: 'subcity',
        },
      ],
      order: [['created_at', 'DESC']],
    });
    const adminsWithImages = admins.map(addProfilePictureUrl);
    res.status(200).json({ success: true, data: adminsWithImages });
  } catch (error) {
    console.log('Error at getting admins', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
    });
  }
};
// Create admin
const createAdmin = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      role,
      city,
      subcity_id,
      department_id,
      sector_id,
      phone,
      division_id,
      first_name,
      last_name,
    } = req.body;
    const admin = req.user;
    console.log(req.body);

    // Required fields
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    // Only SuperAdmin,SuperAdminSupporter and Admin can create admins
    if (!['SuperAdmin', 'SuperAdminSupporter', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to create a new admin',
      });
    }

    // City and subcity check for certain roles
    if (['Editor', 'Viewer'].includes(role) && (!city || !subcity_id)) {
      return res.status(400).json({ message: 'City and subcity are required for this role' });
    }

    // Uniqueness checks
    if (await Admin.findOne({ where: { username } })) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    if (email && (await Admin.findOne({ where: { email } }))) {
      return res.status(400).json({ message: 'Email already taken' });
    }

    if (admin.role === 'Admin' && ['SuperAdmin', 'SuperAdminSupporter'].includes(role)) {
      return res
        .status(400)
        .json({ message: "Admin can't create SuperAdmin or SuperAdminSupporter" });
    }
    // if (department_id && (await Admin.findOne({ where: { department_id } }))) {
    //   return res.status(400).json({ message: 'Department is already assigned to another admin' });
    // }
    // if (sector_id && (await Admin.findOne({ where: { sector_id } }))) {
    //   return res.status(400).json({ message: 'Sector is already assigned to another admin' });
    // }
    //
    // File upload
    const uploadedProfilePicture = req.files?.profile_picture?.[0]?.filename;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = await Admin.create({
      username,
      password: hashedPassword,
      role: role,
      city: role === 'Editor' ? city : null,
      subcity_id: role === 'Editor' || role === 'Admin' ? subcity_id : null,
      sector_id: role === 'Editor' || role === 'Admin' ? sector_id : null,
      division_id: role === 'Editor' || role === 'Admin' ? division_id : null,
      department_id: role === 'Editor' || role === 'Admin' ? department_id : null,
      phone,
      email,
      first_name,
      last_name,
      profile_picture: uploadedProfilePicture,
    });
    await ActivityLogService.logCreate(
      'admin',
      newAdmin.id,
      req.user?.id,
      newAdmin.sector_id,
      newAdmin.subcity_id
    );
    res.status(201).json({
      message: `${role} created successfully`,
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
};
const updateSuperAdmin = async (req, res) => {
  try {
    const admin = req.user;
    const { newPassword, email, phone, currentPassword } = req.body;
    const uploadedProfilePicture = req.files?.profile_picture?.[0]?.filename;
    // Fetch target admin
    const adminToUpdate = await Admin.findByPk(admin.id);
    if (!adminToUpdate) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Restrict role changes for lower privileges
    // === Uniqueness checks ===
    if (email && email !== adminToUpdate.email) {
      const exists = await Admin.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    if (phone && phone !== adminToUpdate.phone) {
      const exists = await Admin.findOne({ where: { phone } });
      if (exists) {
        return res.status(400).json({ message: 'Phone number is already taken' });
      }
    }

    // Prepare update payload
    const updateData = {
      email: email || adminToUpdate.email,
      phone: phone || adminToUpdate.phone,
      profile_picture: uploadedProfilePicture || adminToUpdate.profile_picture,
    };
    // Hash password if provided

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new one' });
      }

      const isMatch = await bcrypt.compare(currentPassword, adminToUpdate.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }
    // Perform update
    const updated = await Admin.update(updateData, { where: { id: adminToUpdate.id } });

    // Fetch the updated admin
    const refreshedAdmin = await Admin.findByPk(adminToUpdate.id);
    await ActivityLogService.logUpdate(
      'admin',
      refreshedAdmin.id,
      req.user?.id,
      {
        admin_username: refreshedAdmin.username,
      },
      refreshedAdmin.sector_id,
      refreshedAdmin.subcity_id
    );

    const adminInfo = addProfilePictureUrl(refreshedAdmin);
    res
      .status(200)
      .json({ success: true, message: 'Admin updated successfully', admin: adminInfo });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message,
    });
  }
};
const updateAdmin = async (req, res) => {
  try {
    const requesterRole = req.user.role;
    const {
      id,
      username,
      password,
      email,
      role,
      city,
      subcity_id,
      department_id,
      sector_id,
      phone,
      division_id,
      first_name,
      last_name,
    } = req.body;
    const uploadedProfilePicture = req.files?.profile_picture?.[0]?.filename;
    console.log(uploadedProfilePicture);
    // Fetch target admin
    const adminToUpdate = await Admin.findByPk(id);
    if (!adminToUpdate) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Restrict role changes for lower privileges
    if (['Editor', 'Viewer'].includes(requesterRole) && role && role !== requesterRole) {
      return res.status(403).json({ message: 'You cannot change your role' });
    }

    if (requesterRole === 'Admin' && ['SuperAdmin', 'SuperAdminSupporter'].includes(role)) {
      return res
        .status(400)
        .json({ message: "Admin can't update SuperAdmin or SuperAdminSupporter" });
    }

    // === Uniqueness checks ===
    if (username && username !== adminToUpdate.username) {
      const exists = await Admin.findOne({ where: { username } });
      if (exists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    if (email && email !== adminToUpdate.email) {
      const exists = await Admin.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // if (department_id && department_id !== adminToUpdate.department_id) {
    //   const exists = await Admin.findOne({ where: { department_id } });
    //   if (exists) {
    //     return res.status(400).json({ message: 'Department is already assigned to another admin' });
    //   }
    // }
    //
    // if (sector_id && sector_id !== adminToUpdate.sector_id) {
    //   const exists = await Admin.findOne({ where: { sector_id } });
    //   if (exists) {
    //     return res.status(400).json({ message: 'Sector is already assigned to another admin' });
    //   }
    // }

    console.log(req.files?.profile_picture?.[0]?.filename);
    // Prepare update payload
    const updateData = {
      username: username || adminToUpdate.username,
      email: email || adminToUpdate.email,
      role: role || adminToUpdate.role,
      city: city || adminToUpdate.city,
      subcity_id: subcity_id || adminToUpdate.subcity_id,
      department_id: department_id || adminToUpdate.department_id,
      sector_id: sector_id || adminToUpdate.sector_id,
      phone: phone || adminToUpdate.phone,
      division_id: division_id || adminToUpdate.division_id,
      first_name: first_name || adminToUpdate.first_name,
      last_name: last_name || adminToUpdate.last_name,
      profile_picture: uploadedProfilePicture || adminToUpdate.profile_picture,
    };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Perform update
    await Admin.update(updateData, { where: { id: adminToUpdate.id } });

    const refreshedAdmin = await Admin.findByPk(adminToUpdate.id);
    await ActivityLogService.logUpdate(
      'admin',
      refreshedAdmin.id,
      req.user?.id,
      {
        admin_username: refreshedAdmin.username,
      },
      refreshedAdmin.sector_id || null,
      refreshedAdmin.subcity_id
    );
    console.log(refreshedAdmin);
    const adminInfo = addProfilePictureUrl(refreshedAdmin);
    res.status(200).json({ admin: adminInfo, message: 'Admin updated successfully' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message,
    });
  }
};
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const admin = req.user;
    if (!id) {
      return res.status(500).json({ message: 'admin not found' });
    }

    const adminToBeDeleted = await Admin.findOne({ where: { id } });
    if (!adminToBeDeleted) {
      return res.status(500).json({ message: 'admin not found' });
    }
    if (admin.role === 'Admin' && ['SuperAdmin', 'SuperAdminSupporter'].includes(role)) {
      return res
        .status(400)
        .json({ message: "Admin can't delete SuperAdmin or SuperAdminSupporter" });
    }

    if (adminToBeDeleted.role === 'Admin' && admin.role === 'Admin') {
      return res.status(500).json({ message: "admin can't delete admin " });
    }
    await Admin.destroy({ where: { id } });
    await ActivityLogService.logDelete(
      'admin',
      adminToBeDeleted.id,
      req.user?.id,
      adminToBeDeleted.sector_id,
      adminToBeDeleted.subcity_id
    );

    return res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.log('Error at deleting admin');
    res.status(500).json({
      success: false,
      message: 'Error deleting admin',
    });
  }
};
// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = req.user;

    const updateData = {};
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (req.file) updateData.profile_picture = req.file.filename;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    const [updated] = await Admin.update(updateData, {
      where: { id: admin.id },
    });

    if (!updated) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const updatedAdmin = await Admin.findByPk(admin.id);

    res.json({
      message: 'Profile updated successfully',
      admin: {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        role: updatedAdmin.role,
        sector: updatedAdmin.section,
        department: updatedAdmin.department,
        profile_picture: updatedAdmin.profile_picture
          ? `/Uploads/profile_pictures/${updatedAdmin.profile_picture}`
          : null,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Request password reset (generates secure token)
const requestPasswordReset = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      // Don't reveal if username exists for security
      return res.json({
        message: 'If the username exists, a reset link will be sent.',
      });
    }

    // Generate cryptographically secure reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate any existing tokens for this admin
    await PasswordReset.update({ used: true }, { where: { admin_id: admin.id, used: false } });

    // Create new reset token record
    await PasswordReset.create({
      admin_id: admin.id,
      token: hashedToken,
      expires_at: expiresAt,
    });

    // In production, send email with resetToken (not hashedToken)
    console.log(`Password reset token for ${username}: ${resetToken}`);
    console.log(`Token expires at: ${expiresAt}`);

    res.json({
      message: 'If the username exists, a reset link will be sent.',
      // Remove this in production - only for testing
      resetToken: resetToken,
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Error processing reset request' });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Validate password strength
    if (new_password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Hash the provided token to compare with stored hash
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid, unused, non-expired token
    const resetRecord = await PasswordReset.findOne({
      where: {
        token: hashedToken,
        used: false,
        expires_at: { [require('sequelize').Op.gt]: new Date() },
      },
      include: [{ model: Admin }],
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(new_password, 12); // Increased salt rounds
    await Admin.update({ password: hashedPassword }, { where: { id: resetRecord.admin_id } });

    // Mark token as used
    await PasswordReset.update({ used: true }, { where: { id: resetRecord.id } });

    // Log security event
    console.log(`Password reset completed for admin ID: ${resetRecord.admin_id}`);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Get statistics
const getStatistics = async (req, res) => {
  try {
    const admin = req.user;
    const currentAdmin = await Admin.findByPk(admin.id);
    let where = {};
    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    const [
      complaintCount,
      pendingComplaints,
      resolvedComplaints,
      employeeCount,
      adminCount,
      ratingCount,
      feedbackCount,
    ] = await Promise.all([
      PublicComplaint.count({ where }),
      PublicComplaint.count({ where: { ...where, status: 'submitted' } }),
      PublicComplaint.count({ where: { ...where, status: 'resolved' } }),
      Employee.count({
        where: where,
      }),
      Admin.count(),
      PublicRating.count({
        where: where,
      }),
      PublicFeedback.count({ where }),
    ]);

    const ratings = await PublicRating.findAll({
      where: where,
      include: [{ model: Employee, as: 'employee', attributes: [] }],
    });

    const averageRating =
      ratings.length > 0
        ? (
            ratings.reduce((sum, r) => sum + (r.courtesy + r.timeliness + r.knowledge) / 3, 0) /
            ratings.length
          ).toFixed(2)
        : 0;

    const feedback = await PublicFeedback.findAll({ where });
    const sentimentCounts = feedback.reduce((acc, fb) => {
      const sentiment = getSentiment(fb.rating);
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalComplaints: complaintCount,
      pendingComplaints,
      resolvedComplaints,
      totalEmployees: employeeCount,
      totalAdmins: adminCount,
      totalRatings: ratingCount,
      totalFeedback: feedbackCount,
      averageRating: parseFloat(averageRating),
      sentimentAnalysis: {
        positive: sentimentCounts.positive || 0,
        neutral: sentimentCounts.neutral || 0,
        negative: sentimentCounts.negative || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

// Get departments
const getDepartments = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    const departments = await Employee.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col(`department_${lang}`)), 'department']],
      where: { [`department_${lang}`]: { [Op.ne]: null } },
      raw: true,
    });

    res.json(departments.map((d) => d.department));
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

// Log admins (for debugging)
const logAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id', 'username', 'role', 'section', 'department'],
    });

    // Reset passwords for all admins to a known value (e.g., 'reset123') and log them
    const resetPassword = 'reset123'; // Change this to a secure value
    const resetResults = await Promise.all(
      admins.map(async (admin) => {
        const hashedPassword = await bcrypt.hash(resetPassword, 10);
        await Admin.update({ password: hashedPassword }, { where: { id: admin.id } });
        console.log(
          `Reset password for ${admin.username} (ID: ${admin.id}, Role: ${admin.role}) to: ${resetPassword}`
        );
        return {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          section: admin.section,
          department: admin.department,
          reset_password: resetPassword,
        };
      })
    );

    res.json({
      message: 'Admin accounts listed and passwords reset',
      admins: resetResults,
    });
  } catch (error) {
    console.error('Error logging/resetting admin passwords:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
};

// Export report
const exportReport = async (req, res) => {
  try {
    const admin = req.user;
    const { lang = 'en', date_from, date_to, type = 'all', format } = req.query;

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    let where = {};
    const currentAdmin = await Admin.findByPk(admin.id);

    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    if (date_from && date_to) {
      where.created_at = {
        [Op.between]: [new Date(date_from), new Date(date_to)],
      };
    }

    let reportData = {};

    // Fetch Complaints
    if (type === 'all' || type === 'complaints') {
      const complaints = await PublicComplaint.findAll({
        where,
        include: [
          { model: Sector, as: 'sector', required: false },
          { model: Division, as: 'division', required: false },
          { model: Employee, as: 'employee', required: false },
          { model: Department, as: 'department', required: false },
          { model: Subcity, as: 'sub_city', required: false },
        ],
        order: [['created_at', 'DESC']],
      });
      reportData.complaints = complaints.map((c) => c.get({ plain: true }));
    }

    // Fetch Feedback
    if (type === 'all' || type === 'feedback') {
      const feedback = await PublicFeedback.findAll({
        where,
        include: [{ model: Sector, as: 'sector', required: false }],
        order: [['created_at', 'DESC']],
      });
      reportData.feedback = feedback.map((fb) => ({
        ...fb.get({ plain: true }),
        sentiment: getSentiment(fb.rating), // Assuming getSentiment is defined
      }));
    }

    // Fetch Employees
    if (type === 'all' || type === 'employees') {
      const employees = await Employee.findAll({
        where,
        include: [
          { model: Sector, as: 'sector', required: false },
          { model: Division, as: 'division', required: false },
          { model: Department, as: 'department', required: false },
          { model: Subcity, as: 'subcity', required: false },
        ],
        order: [['created_at', 'DESC']],
      });
      reportData.employees = employees.map((e) => e.get({ plain: true }));
    }

    // Define headers for each data type
    const complaintHeaders = [
      'ID',
      'Phone Number',
      'Department',
      'Employee Name',
      'Description',
      'Response',
      'Status',
      'Sector',
      'Division',
      'Subcity',
      'Created At',
    ];

    const feedbackHeaders = [
      'ID',
      'Phone Number',
      'Full name',
      'Sector ',
      'Feedback text',
      'Feedback type',
      'Created At',
    ];

    const employeeHeaders = [
      'ID',
      'Phone',
      'First Name',
      'Middle Name',
      'Last Name',
      'Office Number',
      'Floor Number',
      'Position',
      'Department',
      'Subcity',
      'Sector',
      'Division',
      'Created At',
    ];
    const filename = `report-${Date.now()}.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;
    console.log('Format value:', format);
    console.log('Filename will be:', filename);
    // CSV Export
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      let csvContent = '';

      // Complaints CSV
      if (reportData.complaints?.length) {
        csvContent += 'Complaints\n';
        csvContent += complaintHeaders.join(',') + '\n';
        reportData.complaints.forEach((c) => {
          csvContent +=
            [
              c.id,
              `${c.phone_number || ''}`,
              `${c.department?.name_en || ''}`,
              `${c.employee ? `${c.employee.first_name_en} ${c.employee.middle_name_en || ''} ${c.employee.last_name_en}` : ''}`,
              `${(c.complaint_description || '').replace(/"/g, '""')}`,
              `${(c.response || '').replace(/"/g, '""')}`,
              `${c.status || ''}`,
              `${c.sector?.name_en || ''}`,
              `${c.division?.name_en || ''}`,
              `${c.sub_city?.name_en || ''}`,
              `${c.created_at}`,
            ].join(',') + '\n';
        });
        csvContent += '\n';
      }

      // Feedback CSV
      if (reportData.feedback?.length) {
        csvContent += 'Feedback\n';
        csvContent += feedbackHeaders.join(',') + '\n';
        reportData.feedback.forEach((fb) => {
          csvContent +=
            [
              fb.id,
              `${fb.phone_number || ''}`,
              `${fb.full_name || ''}`,
              `${(fb.sector.name_en || '').replace(/"/g, '""')}`,
              `${fb.feedback_text || ''}`,
              `${fb.feedback_type || ''}`,
              `${fb.created_at}`,
            ].join(',') + '\n';
        });
        csvContent += '\n';
      }

      // Employees CSV
      if (reportData.employees?.length) {
        csvContent += 'Employees\n';
        csvContent += employeeHeaders.join(',') + '\n';
        reportData.employees.forEach((emp) => {
          csvContent +=
            [
              emp.id,
              `${emp.phone || ''}`,
              `${emp.first_name_en || ''}`,
              `${emp.middle_name_en || ''}`,
              `${emp.last_name_en || ''}`,
              `${emp.office_number || ''}`,
              emp.floor_number || '',
              `${emp.position_en || ''}`,
              `${emp.department?.name_en || ''}`,
              `${emp.subcity?.name_en || ''}`,
              `${emp.sector?.name_en || ''}`,
              `${emp.division?.name_en || ''}`,
              `${emp.created_at}`,
            ].join(',') + '\n';
        });
      }

      return res.send(csvContent);
    }

    // Excel Export
    if (format === 'excel') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const workbook = new ExcelJS.Workbook();

      // Complaints Sheet
      if (reportData.complaints?.length) {
        const complaintSheet = workbook.addWorksheet('Complaints');
        complaintSheet.addRow(complaintHeaders);
        reportData.complaints.forEach((c) => {
          complaintSheet.addRow([
            c.id,
            c.phone_number || '',
            c.department?.name_en || '',
            c.employee
              ? `${c.employee.first_name_en} ${c.employee.middle_name_en || ''} ${c.employee.last_name_en}`
              : '',
            c.complaint_description || '',
            c.response || '',
            c.status || '',
            c.sector?.name_en || '',
            c.division?.name_en || '',
            c.sub_city?.name_en || '',
            c.created_at,
          ]);
        });
      }

      // Feedback Sheet
      if (reportData.feedback?.length) {
        const feedbackSheet = workbook.addWorksheet('Feedback');
        feedbackSheet.addRow(feedbackHeaders);
        reportData.feedback.forEach((fb) => {
          feedbackSheet.addRow([
            fb.id,
            `${fb.phone_number || ''}`,
            `${fb.full_name || ''}`,
            `${(fb.sector.name_en || '').replace(/"/g, '""')}`,
            `${fb.feedback_text || ''}`,
            `${fb.feedback_type || ''}`,
            `${fb.created_at}`,
          ]);
        });
      }

      // Employees Sheet
      if (reportData.employees?.length) {
        const employeeSheet = workbook.addWorksheet('Employees');
        employeeSheet.addRow(employeeHeaders);
        reportData.employees.forEach((emp) => {
          employeeSheet.addRow([
            emp.id,
            emp.phone || '',
            emp.first_name_en || '',
            emp.middle_name_en || '',
            emp.last_name_en || '',
            emp.office_number || '',
            emp.floor_number || '',
            emp.position_en || '',
            emp.department?.name_en || '',
            emp.subcity?.name_en || '',
            emp.sector?.name_en || '',
            emp.division?.name_en || '',
            emp.created_at,
          ]);
        });
      }

      // Write the workbook to the response
      await workbook.xlsx.write(res);
      return res.end();
    } // Default JSON response
    res.json(reportData);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ message: 'Error exporting report', error: error.message });
  }
};
const exportSubcity = async (req, res) => {
  try {
    const admin = req.user;
    const { lang = 'en', type = 'all', format, subcity_id } = req.query;
    console.log('id', subcity_id);

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    let where = { subcity_id };
    const currentAdmin = await Admin.findByPk(admin.id);

    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    let reportData = {};

    // Fetch Complaints
    if (type === 'all' || type === 'complaints') {
      const complaints = await PublicComplaint.findAll({
        where,
        include: [
          { model: Sector, as: 'sector', required: false },
          { model: Division, as: 'division', required: false },
          { model: Employee, as: 'employee', required: false },
          { model: Department, as: 'department', required: false },
          { model: Subcity, as: 'sub_city', required: false },
        ],
        order: [['created_at', 'DESC']],
      });
      reportData.complaints = complaints.map((c) => c.get({ plain: true }));
    }

    // Fetch Feedback
    if (type === 'all' || type === 'feedback') {
      const feedback = await PublicFeedback.findAll({
        where,
        include: [{ model: Sector, as: 'sector', required: false }],
        order: [['created_at', 'DESC']],
      });
      reportData.feedback = feedback.map((fb) => ({
        ...fb.get({ plain: true }),
        sentiment: getSentiment(fb.rating), // Assuming getSentiment is defined
      }));
    }

    // Fetch Employees
    if (type === 'all' || type === 'employees') {
      const employees = await Employee.findAll({
        where,
        include: [
          { model: Sector, as: 'sector', required: false },
          { model: Division, as: 'division', required: false },
          { model: Department, as: 'department', required: false },
          { model: Subcity, as: 'subcity', required: false },
        ],
        order: [['created_at', 'DESC']],
      });
      reportData.employees = employees.map((e) => e.get({ plain: true }));
    }

    // Define headers for each data type
    const complaintHeaders = [
      'ID',
      'Phone Number',
      'Department',
      'Employee Name',
      'Description',
      'Response',
      'Status',
      'Sector',
      'Division',
      'Subcity',
      'Created At',
    ];

    const feedbackHeaders = [
      'ID',
      'Phone Number',
      'Full name',
      'Sector ',
      'Feedback text',
      'Feedback type',
      'Created At',
    ];

    const employeeHeaders = [
      'ID',
      'Phone',
      'First Name',
      'Middle Name',
      'Last Name',
      'Office Number',
      'Floor Number',
      'Position',
      'Department',
      'Subcity',
      'Sector',
      'Division',
      'Created At',
    ];
    const filename = `report-${Date.now()}.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;
    console.log('Format value:', format);
    console.log('Filename will be:', filename);
    // CSV Export
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      let csvContent = '';

      // Complaints CSV
      if (reportData.complaints?.length) {
        csvContent += 'Complaints\n';
        csvContent += complaintHeaders.join(',') + '\n';
        reportData.complaints.forEach((c) => {
          csvContent +=
            [
              c.id,
              `${c.phone_number || ''}`,
              `${c.department?.name_en || ''}`,
              `${c.employee ? `${c.employee.first_name_en} ${c.employee.middle_name_en || ''} ${c.employee.last_name_en}` : ''}`,
              `${(c.complaint_description || '').replace(/"/g, '""')}`,
              `${(c.response || '').replace(/"/g, '""')}`,
              `${c.status || ''}`,
              `${c.sector?.name_en || ''}`,
              `${c.division?.name_en || ''}`,
              `${c.sub_city?.name_en || ''}`,
              `${c.created_at}`,
            ].join(',') + '\n';
        });
        csvContent += '\n';
      }

      // Feedback CSV
      if (reportData.feedback?.length) {
        csvContent += 'Feedback\n';
        csvContent += feedbackHeaders.join(',') + '\n';
        reportData.feedback.forEach((fb) => {
          csvContent +=
            [
              fb.id,
              `${fb.phone_number || ''}`,
              `${fb.full_name || ''}`,
              `${(fb.sector.name_en || '').replace(/"/g, '""')}`,
              `${fb.feedback_text || ''}`,
              `${fb.feedback_type || ''}`,
              `${fb.created_at}`,
            ].join(',') + '\n';
        });
        csvContent += '\n';
      }

      // Employees CSV
      if (reportData.employees?.length) {
        csvContent += 'Employees\n';
        csvContent += employeeHeaders.join(',') + '\n';
        reportData.employees.forEach((emp) => {
          csvContent +=
            [
              emp.id,
              `${emp.phone || ''}`,
              `${emp.first_name_en || ''}`,
              `${emp.middle_name_en || ''}`,
              `${emp.last_name_en || ''}`,
              `${emp.office_number || ''}`,
              emp.floor_number || '',
              `${emp.position_en || ''}`,
              `${emp.department?.name_en || ''}`,
              `${emp.subcity?.name_en || ''}`,
              `${emp.sector?.name_en || ''}`,
              `${emp.division?.name_en || ''}`,
              `${emp.created_at}`,
            ].join(',') + '\n';
        });
      }

      return res.send(csvContent);
    }

    // Excel Export
    if (format === 'excel') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const workbook = new ExcelJS.Workbook();

      // Complaints Sheet
      if (reportData.complaints?.length) {
        const complaintSheet = workbook.addWorksheet('Complaints');
        complaintSheet.addRow(complaintHeaders);
        reportData.complaints.forEach((c) => {
          complaintSheet.addRow([
            c.id,
            c.phone_number || '',
            c.department?.name_en || '',
            c.employee
              ? `${c.employee.first_name_en} ${c.employee.middle_name_en || ''} ${c.employee.last_name_en}`
              : '',
            c.complaint_description || '',
            c.response || '',
            c.status || '',
            c.sector?.name_en || '',
            c.division?.name_en || '',
            c.sub_city?.name_en || '',
            c.created_at,
          ]);
        });
      }

      // Feedback Sheet
      if (reportData.feedback?.length) {
        const feedbackSheet = workbook.addWorksheet('Feedback');
        feedbackSheet.addRow(feedbackHeaders);
        reportData.feedback.forEach((fb) => {
          feedbackSheet.addRow([
            fb.id,
            `${fb.phone_number || ''}`,
            `${fb.full_name || ''}`,
            `${(fb.sector.name_en || '').replace(/"/g, '""')}`,
            `${fb.feedback_text || ''}`,
            `${fb.feedback_type || ''}`,
            `${fb.created_at}`,
          ]);
        });
      }

      // Employees Sheet
      if (reportData.employees?.length) {
        const employeeSheet = workbook.addWorksheet('Employees');
        employeeSheet.addRow(employeeHeaders);
        reportData.employees.forEach((emp) => {
          employeeSheet.addRow([
            emp.id,
            emp.phone || '',
            emp.first_name_en || '',
            emp.middle_name_en || '',
            emp.last_name_en || '',
            emp.office_number || '',
            emp.floor_number || '',
            emp.position_en || '',
            emp.department?.name_en || '',
            emp.subcity?.name_en || '',
            emp.sector?.name_en || '',
            emp.division?.name_en || '',
            emp.created_at,
          ]);
        });
      }

      // Write the workbook to the response
      await workbook.xlsx.write(res);
      return res.end();
    } // Default JSON response
    res.json(reportData);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ message: 'Error exporting report', error: error.message });
  }
};

// Get complaint trends for analytics
const getComplaintTrends = async (req, res) => {
  try {
    const admin = req.user;
    const { start_date, end_date, interval = 'day' } = req.query;

    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date
      ? new Date(start_date)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const where = {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    };

    if (admin.role === 'Admin') {
      where.subcity_id = admin.subcity;
    }
    // Get complaints within date range
    const complaints = await PublicComplaint.findAll({
      where,
      order: [['created_at', 'ASC']],
    });

    const trendsData = [];
    const dateMap = new Map();

    complaints.forEach((complaint) => {
      const date = new Date(complaint.created_at);
      let dateKey;

      // Format date based on interval
      switch (interval) {
        case 'week':
          // Get start of week (Monday)
          const startOfWeek = new Date(date);
          const day = startOfWeek.getDay();
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
          startOfWeek.setDate(diff);
          dateKey = startOfWeek.toISOString().split('T')[0];
          break;
        case 'month':
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'day':
        default:
          dateKey = date.toISOString().split('T')[0];
          break;
      }

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          total: 0,
          pending: 0,
          resolved: 0,
        });
      }

      const entry = dateMap.get(dateKey);
      entry.total++;
      if (complaint.status === 'pending') {
        entry.pending++;
      } else if (complaint.status === 'resolved') {
        entry.resolved++;
      }
    });

    const trends = Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(trends);
  } catch (error) {
    console.error('Error fetching complaint trends:', error);
    res.status(500).json({
      message: 'Error fetching complaint trends',
      error: error.message,
    });
  }
};

// Get hierarchical location structure
const getLocationHierarchy = async (req, res) => {
  try {
    const admin = req.user;

    let locations = {};

    if (admin.role === 'SuperAdmin') {
      // SuperAdmin can see all cities and subcities
      locations = {
        'Addis Ababa': {
          subcities: ['Arada', 'Kirkos', 'Lideta', 'Bole', 'Yeka', 'Addis Ketema'],
          departments: [
            'Control and Awareness Department',
            'Engineering Department',
            'Support Administration Department',
            'Control Center Department',
          ],
        },
      };
    } else if (admin.role === 'SubCityAdmin') {
      // SubCityAdmin can only see their specific subcity
      locations = {
        [admin.city]: {
          subcities: [admin.subcity],
          departments: [
            'Control and Awareness Department',
            'Engineering Department',
            'Support Administration Department',
            'Control Center Department',
          ],
        },
      };
    } else if (admin.role === 'Admin') {
      // Department admin can see their department across all locations
      locations = {
        'Addis Ababa': {
          subcities: ['Arada', 'Kirkos', 'Lideta', 'Bole', 'Yeka', 'Addis Ketema'],
          departments: [admin.department],
        },
      };
    }

    res.json({
      success: true,
      data: {
        locations,
        admin_scope: {
          role: admin.role,
          city: admin.city,
          subcity: admin.subcity,
          department: admin.department,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching location hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location hierarchy',
    });
  }
};

// Get statistics with city/subcity filtering
const getStatisticsWithLocation = async (req, res) => {
  try {
    const { city, subcity } = req.query;
    const admin = req.user;

    const whereClause = {};

    // Role-based filtering
    if (admin.role === 'SubCityAdmin') {
      if (admin.city) whereClause.city = admin.city;
      if (admin.subcity) whereClause.subcity = admin.subcity;
    } else if (admin.role === 'Admin') {
      if (admin.department) whereClause.department = admin.department;
    } else if (admin.role === 'SuperAdmin') {
      if (city) whereClause.city = city;
      if (subcity) whereClause.subcity = subcity;
    }

    const employeeCount = await Employee.count({ where: whereClause });
    // Add other counts when ready

    res.json({
      success: true,
      data: {
        employees: employeeCount,
        complaints: 0,
        feedback: 0,
        ratings: 0,
        filters_applied: whereClause,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};
// Get ratings (Admin view)
const getRatingsAdmin = async (req, res) => {
  try {
    const { lang = 'en', date_from, date_to } = req.query;
    const admin = req.user;

    let whereClause = {};

    const currentAdmin = await Admin.findByPk(admin.id);
    let where = {};
    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    // Apply date filtering
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    const ratings = await Rating.findAll({
      where: whereClause,
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name_en', 'name_am', 'name_af', 'created_at'],
        },
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name_en', 'name_am', 'name_af', 'created_at', 'sector_id'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name_en', 'name_am', 'name_af', 'sector_id', 'division_id'],
        },
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'first_name_en', 'last_name_en', 'position_en'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Transform data to match API spec
    // const transformedRatings = ratings.map((rating) => ({
    //   id: rating.id,
    //   employee_name: `${rating.Employee?.[`first_name_${lang}`] || ''} ${
    //     rating.Employee?.[`last_name_${lang}`] || ''
    //   }`.trim(),
    //   employee_id: rating.employee_id,
    //   department: rating.Employee?.[`department_${lang}`] || rating.Employee?.section,
    //   phone_number: rating.phone_number,
    //   courtesy: rating.courtesy,
    //   timeliness: rating.timeliness,
    //   knowledge: rating.knowledge,
    //   overall_experience: rating.overall_experience,
    //   suggestions: rating.suggestions,
    //   section: rating.Employee?.section,
    //   city: rating.Employee?.city,
    //   subcity: rating.Employee?.subcity,
    //   created_at: rating.created_at,
    // }));
    //
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Error fetching ratings', error: error.message });
  }
};

// Get public ratings (Admin view)
const getPublicRatingsAdmin = async (req, res) => {
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

    const ratings = await PublicRating.findAll({
      where: where,
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name_en', 'name_am', 'name_af', 'created_at'],
        },
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name_en', 'name_am', 'name_af', 'created_at', 'sector_id'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name_en', 'name_am', 'name_af', 'sector_id', 'division_id'],
        },
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'first_name_en', 'last_name_en', 'position_en'],
        },
        {
          model: Subcity,
          as: 'sub_city',
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(ratings);
  } catch (error) {
    console.error('Error fetching public ratings:', error);
    res.status(500).json({ message: 'Error fetching public ratings', error: error.message });
  }
};

// Respond to feedback
const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, lang = 'en' } = req.body;
    const admin = req.user;

    if (!response || response.length < 10) {
      return res.status(400).json({ message: 'Response must be at least 10 characters long' });
    }

    const feedback = await PublicFeedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const employee = await Employee.findByPk(feedback.employee_id);
    console.log(employee);
    if (admin.role === 'SubCityAdmin' && employee?.subcity !== admin.subcity) {
      return res.status(403).json({ message: 'Cannot respond to feedback from another subcity' });
    }
    if (admin.role === 'Admin' && employee?.department !== admin.department) {
      return res.status(403).json({
        message: 'Cannot respond to feedback from another department',
      });
    }

    await feedback.update({
      admin_response: response,
      status: 'responded',
      responded_at: new Date(),
    });
    await ActivityLogService.logUpdate(
      'feedback',
      feedback.id,
      req.user?.id,
      feedback.sector_id,
      feedback.subcity_id
    );
    res.json({
      message: 'Response added successfully',
      feedback: {
        id: feedback.id,
        status: 'responded',
        response: response,
        responded_at: feedback.responded_at,
      },
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({ message: 'Error responding to feedback', error: error.message });
  }
};

// Respond to public feedback
const respondToPublicFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const admin = req.user;

    if (!response || response.length < 10) {
      return res.status(400).json({ message: 'Response must be at least 10 characters long' });
    }

    const feedback = await PublicFeedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Public feedback not found' });
    }

    // Check role-based access
    if (admin.role === 'Admin' && feedback.department !== admin.department) {
      return res.status(403).json({
        message: 'Cannot respond to feedback from another department',
      });
    }

    await feedback.update({
      admin_response: response,
      responded_by: admin.id,
      responded_at: new Date(),
      status: 'responded',
    });

    await ActivityLogService.logUpdate(
      'feedback',
      feedback.id,
      req.user?.id,
      feedback.sector_id,
      feedback.subcity_id
    );
    res.json({
      message: 'Response added successfully',
      feedback: {
        id: feedback.id,
        status: 'responded',
        response_text: response,
        responded_at: feedback.responded_at,
      },
    });
  } catch (error) {
    console.error('Error responding to public feedback:', error);
    res.status(500).json({
      message: 'Error responding to public feedback',
      error: error.message,
    });
  }
};

// Export employees specifically
const exportEmployees = async (req, res) => {
  try {
    const admin = req.user;
    const { lang = 'en', format = 'csv' } = req.query;

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    let where = {};

    const currentAdmin = await Admin.findByPk(admin.id);
    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    const employees = await Employee.findAll({
      where,
      include: [
        { model: require('../models').Sector, as: 'sector', required: false },
        { model: require('../models').Division, as: 'division', required: false },
        { model: require('../models').Department, as: 'department', required: false },
        { model: require('../models').Subcity, as: 'subcity', required: false },
      ],
      order: [['created_at', 'DESC']],
    });

    const headers = [
      'ID',
      'First Name',
      'Middle Name',
      'Last Name',
      'Office Number',
      'Floor Number',
      'Position',
      'Department',
      'Section',
      'City',
      'Subcity',
      'Sector',
      'Division',
      'Created At',
    ];

    const filename = `employees-${Date.now()}.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;

    // --- CSV EXPORT ---
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      let csvContent = headers.join(',') + '\n';

      employees.forEach((emp) => {
        csvContent +=
          [
            emp.id,
            `${emp.phone} || ''`,
            `${emp.first_name_en} || ''`,
            `${emp.middle_name_en || ''}`,
            `${emp.last_name_en}`,
            `${emp.office_number}`,
            emp.floor_number,
            `${emp.position_en}`,
            `${emp.department?.name_en || ''}`,
            `${emp.subcity?.name_en || ''}`,
            `${emp.sector?.name_en || ''}`,
            `${emp.division?.name_en || ''}`,
            `${emp.employeeDepartment?.name_en || ''}`,
            `${emp.created_at}`,
          ].join(',') + '\n';
      });

      return res.send(csvContent);
    }

    // --- EXCEL EXPORT ---
    if (format === 'excel') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Employees');

      sheet.addRow(headers);

      employees.forEach((emp) => {
        sheet.addRow([
          emp.id,
          `${emp.phone}`,
          `${emp.first_name_en}`,
          `${emp.middle_name_en || ''}`,
          `${emp.last_name_en}`,
          `${emp.office_number}`,
          emp.floor_number,
          `${emp.position_en}`,
          `${emp.department?.name_en || ''}`,
          `${emp.subcity?.name_en || ''}`,
          `${emp.sector?.name_en || ''}`,
          `${emp.division?.name_en || ''}`,
          `${emp.employeeDepartment?.name_en || ''}`,
          `${emp.created_at}`,
        ]);
      });

      await workbook.xlsx.write(res);
      return res.end();
    }

    // --- PDF EXPORT ---
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      doc.pipe(res);

      doc.fontSize(16).text('Employees Report', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10).text(headers.join(' | '));
      doc.moveDown();

      employees.forEach((emp) => {
        doc.text(
          [
            emp.id,
            `${emp.phone}`,
            `${emp.first_name_en}`,
            `${emp.middle_name_en || ''}`,
            `${emp.last_name_en}`,
            `${emp.office_number}`,
            emp.floor_number,
            `${emp.position_en}`,
            `${emp.department?.name_en || ''}`,
            `${emp.subcity?.name_en || ''}`,
            `${emp.sector?.name_en || ''}`,
            `${emp.division?.name_en || ''}`,
            `${emp.employeeDepartment?.name_en || ''}`,
            `${emp.created_at}`,
          ].join(' | ')
        );
      });

      doc.end();
      return;
    }

    // --- DEFAULT FALLBACK ---
    res.json({ employees });
  } catch (error) {
    console.error('Error exporting employees:', error);
    res.status(500).json({ message: 'Error exporting employees', error: error.message });
  }
};
// Export complaints specifically
const exportComplaints = async (req, res) => {
  try {
    const admin = req.user;
    const { lang = 'en', format = 'csv' } = req.query;

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    let where = {};
    const currentAdmin = await Admin.findByPk(admin.id);
    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    const complaints = await PublicComplaint.findAll({
      where,
      include: [
        { model: require('../models').Sector, as: 'sector', required: false },
        { model: require('../models').Division, as: 'division', required: false },
        { model: require('../models').Employee, as: 'employee', required: false },
        { model: require('../models').Department, as: 'department', required: false },
        { model: require('../models').Subcity, as: 'sub_city', required: false },
      ],
      order: [['created_at', 'DESC']],
    });

    const headers = [
      'ID',
      'Phone Number',
      'Department',
      'Employee ID',
      'Description',
      'Response',
      'Status',
      'Sector',
      'Division',
      'Subcity',
      'Created At',
    ];

    const filename = `complaints-${Date.now()}.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;

    // --- CSV EXPORT ---
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      let csvContent = headers.join(',') + '\n';

      complaints.forEach((c) => {
        csvContent +=
          [
            c.id,
            `${c.phone_number}`,
            `${c.department?.name_en || ''}`,
            `${c.employee.first_name_en + ' ' + c.employee.middle_name_en + ' ' + c.employee.last_name_en || ''}`,
            `${(c.complaint_description || '').replace(/"/g, '""')}`,
            `${(c.response || '').replace(/"/g, '""')}`,
            `${c.status || ''}`,
            `${c.sector?.name_en || ''}`,
            `${c.division?.name_en || ''}`,
            `${c.department?.name_en || ''}`,
            `${c.sub_city?.name_en || ''}`,
            `${c.created_at}`,
          ].join(',') + '\n';
      });

      return res.send(csvContent);
    }

    // --- EXCEL EXPORT ---
    if (format === 'excel') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Complaints');

      sheet.addRow(headers);

      complaints.forEach((c) => {
        sheet.addRow([
          c.id,
          `${c.phone_number}`,
          `${c.department?.name_en || ''}`,
          `${c.employee.first_name_en + ' ' + c.employee.middle_name_en + ' ' + c.employee.last_name_en || ''}`,
          `${(c.complaint_description || '').replace(/"/g, '""')}`,
          `${(c.response || '').replace(/"/g, '""')}`,
          `${c.status || ''}`,
          `${c.sector?.name_en || ''}`,
          `${c.division?.name_en || ''}`,
          `${c.department?.name_en || ''}`,
          `${c.sub_city?.name_en || ''}`,
          `${c.created_at}`,
        ]);
      });

      await workbook.xlsx.write(res);
      return res.end();
    }

    // --- PDF EXPORT ---
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      doc.pipe(res);

      doc.fontSize(16).text('Complaints Report', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10).text(headers.join(' | '));
      doc.moveDown();

      complaints.forEach((c) => {
        doc.text(
          [
            c.id,
            `${c.phone_number}`,
            `${c.department?.name_en || ''}`,
            `${c.employee.first_name_en + ' ' + c.employee.middle_name_en + ' ' + c.employee.last_name_en || ''}`,
            `${(c.complaint_description || '').replace(/"/g, '""')}`,
            `${(c.response || '').replace(/"/g, '""')}`,
            `${c.status || ''}`,
            `${c.sector?.name_en || ''}`,
            `${c.division?.name_en || ''}`,
            `${c.department?.name_en || ''}`,
            `${c.sub_city?.name_en || ''}`,
            `${c.created_at}`,
          ].join(' | ')
        );
      });

      doc.end();
      return;
    }

    // --- DEFAULT FALLBACK ---
    res.json({ complaints });
  } catch (error) {
    console.error('Error exporting complaints:', error);
    res.status(500).json({ message: 'Error exporting complaints', error: error.message });
  }
};
// Export feedback specifically
const exportFeedback = async (req, res) => {
  try {
    const admin = req.user;
    const { lang = 'en', format = 'csv' } = req.query;

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    const where = {};
    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    const feedback = await Feedback.findAll({
      where,
      attributes: [
        'id',
        'phone_number',
        'section',
        'department',
        'employee_id',
        [`comment_${lang}`, 'comment'],
        'rating',
        'created_at',
      ],
      order: [['created_at', 'DESC']],
    });

    // Set appropriate headers for file download
    const filename = `feedback-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // CSV headers
      const csvHeaders =
        'ID,Phone Number,Section,Department,Employee ID,Comment,Rating,Created At\n';
      let csvContent = csvHeaders;

      feedback.forEach((fb) => {
        csvContent += `${fb.id},"${fb.phone_number}","${fb.section}","${
          fb.department
        }",${fb.employee_id},"${(fb.comment || '').replace(/"/g, '""')}",${
          fb.rating
        },"${fb.created_at}"\n`;
      });

      res.send(csvContent);
    } else {
      // For other formats, return JSON for now
      res.json({ feedback });
    }
  } catch (error) {
    console.error('Error exporting feedback:', error);
    res.status(500).json({ message: 'Error exporting feedback', error: error.message });
  }
};

module.exports = {
  adminLogin,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateSuperAdmin,
  requestPasswordReset,
  resetPassword,
  getStatistics,
  getDepartments,
  logAdmins,
  exportReport,
  exportSubcity,
  getComplaintTrends,
  getLocationHierarchy,
  getStatisticsWithLocation,
  getRatingsAdmin,
  getPublicRatingsAdmin,
  respondToFeedback,
  respondToPublicFeedback,
  exportEmployees,
  exportComplaints,
  exportFeedback,
};
