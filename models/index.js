const Admin = require('./Admin');
const Employee = require('./Employee');
const Complaint = require('./Complaint');
const Rating = require('./Rating');
const Feedback = require('./Feedback');
const PasswordReset = require('./PasswordReset');
const ActivityLog = require('./ActivityLogs');
// Public citizen-facing models
const PublicComplaint = require('./PublicComplaint');
const PublicRating = require('./PublicRating');
const PublicFeedback = require('./PublicFeedback');
const Department = require('./Department');
const Office = require('./Office');
const Sector = require('./Sector');
const Division = require('./Division');
const Team = require('./Team');
const Subcity = require('./Subcity');

ActivityLog.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });
ActivityLog.belongsTo(Sector, { foreignKey: 'sector_id', as: 'sector' });
ActivityLog.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
ActivityLog.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
ActivityLog.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'subcity' });
ActivityLog.belongsTo(PublicComplaint, {
  foreignKey: 'public_complaint_id',
  as: 'public-complaint',
});
ActivityLog.belongsTo(PublicRating, { foreignKey: 'public_rating_id', as: 'public-rating' });
ActivityLog.belongsTo(PublicFeedback, { foreignKey: 'public_feedback_id', as: 'public-feedback' });
// Complaint models
Complaint.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'sub_city' });
Subcity.hasMany(Complaint, { foreignKey: 'subcity_id', as: 'complaints' });

PublicComplaint.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'sub_city' });
Subcity.hasMany(PublicComplaint, { foreignKey: 'subcity_id', as: 'public_complaints' });

// Rating models
Rating.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'sub_city' });
Subcity.hasMany(Rating, { foreignKey: 'subcity_id', as: 'ratings' });

PublicRating.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'sub_city' });
Subcity.hasMany(PublicRating, { foreignKey: 'subcity_id', as: 'public_ratings' });

// Feedback models
Feedback.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'sub_city' });
Subcity.hasMany(Feedback, { foreignKey: 'subcity_id', as: 'feedbacks' });

PublicFeedback.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'sub_city' });
Subcity.hasMany(PublicFeedback, { foreignKey: 'subcity_id', as: 'public_feedbacks' });
// Define relationships
Rating.belongsTo(Employee, { foreignKey: 'employee_id' });
Feedback.belongsTo(Employee, { foreignKey: 'employee_id' });
PasswordReset.belongsTo(Admin, { foreignKey: 'admin_id' });

// Admin relationships
Admin.hasMany(PasswordReset, { foreignKey: 'admin_id' });
Admin.belongsTo(Sector, { foreignKey: 'sector_id', as: 'sector' });
Sector.hasMany(Admin, { foreignKey: 'sector_id', as: 'admins' });

Admin.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
Division.hasMany(Admin, { foreignKey: 'division_id', as: 'admins' });

Admin.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(Admin, { foreignKey: 'department_id', as: 'admins' });

Admin.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'subcity' });
Subcity.hasMany(Admin, { foreignKey: 'subcity_id', as: 'admins' });
// Public models relationships
Department.hasMany(Office, { foreignKey: 'department_id', as: 'offices' });
Office.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Sector and Division relationships
Sector.hasMany(Division, { foreignKey: 'sector_id', as: 'divisions' });
Division.belongsTo(Sector, { foreignKey: 'sector_id', as: 'sector' });

// Division and Department relationships
Division.hasMany(Department, { foreignKey: 'division_id', as: 'departments' });
Department.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });

// Department and Team relationships
Department.hasMany(Team, { foreignKey: 'department_id', as: 'teams' });
Team.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Employee organizational hierarchy relationships
Employee.belongsTo(Sector, { foreignKey: 'sector_id', as: 'sector' });
Employee.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
Employee.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department',
});
Employee.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Employee.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'subcity' });
Employee.hasMany(Complaint, {
  foreignKey: 'employee_id',
  as: 'complaints',
});

Employee.hasMany(PublicComplaint, {
  foreignKey: 'employee_id',
  as: 'public_complaints',
});

Sector.hasMany(Employee, { foreignKey: 'sector_id', as: 'employees' });
Division.hasMany(Employee, { foreignKey: 'division_id', as: 'employees' });
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });
Team.hasMany(Employee, { foreignKey: 'team_id', as: 'employees' });

Complaint.belongsTo(Admin, { foreignKey: 'responded_by', as: 'resolver' });
Complaint.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee',
});
Complaint.belongsTo(Division, {
  foreignKey: 'division_id',
  as: 'division',
});
Complaint.belongsTo(Sector, {
  foreignKey: 'sector_id',
  as: 'sector',
});
Complaint.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Team.hasMany(Complaint, {
  foreignKey: 'team_id',
  as: 'complaints',
});

PublicComplaint.belongsTo(Admin, { foreignKey: 'responded_by', as: 'resolver' });
PublicComplaint.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee',
});
PublicComplaint.belongsTo(Division, {
  foreignKey: 'division_id',
  as: 'division',
});
PublicComplaint.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department',
});
PublicComplaint.belongsTo(Sector, {
  foreignKey: 'sector_id',
  as: 'sector',
});
PublicComplaint.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
PublicComplaint.belongsTo(Office, { foreignKey: 'office_id', as: 'office' });
Team.hasMany(PublicComplaint, {
  foreignKey: 'team_id',
  as: 'public_complaints',
});
PublicRating.belongsTo(Sector, {
  foreignKey: 'sector_id',
  as: 'sector',
});
PublicRating.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
PublicRating.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department',
});
PublicRating.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

Rating.belongsTo(Sector, {
  foreignKey: 'sector_id',
  as: 'sector',
});
Rating.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
Rating.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department',
});
Rating.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

//PublicFeedback
//
PublicFeedback.belongsTo(Admin, {
  foreignKey: 'responded_by',
  as: 'responder',
});
PublicFeedback.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee',
});
PublicFeedback.belongsTo(Division, {
  foreignKey: 'division_id',
  as: 'division',
});
PublicFeedback.belongsTo(Team, {
  foreignKey: 'team_id',
  as: 'team',
});

PublicFeedback.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department',
});

PublicFeedback.belongsTo(Sector, {
  foreignKey: 'sector_id',
  as: 'sector',
});

Sector.hasMany(PublicFeedback, {
  foreignKey: 'sector_id',
  as: 'public_feedbacks',
});

Division.hasMany(PublicFeedback, {
  foreignKey: 'division_id',
  as: 'public_feedbacks',
});

Department.hasMany(PublicFeedback, {
  foreignKey: 'department_id',
  as: 'public_feedbacks',
});

Team.hasMany(PublicFeedback, {
  foreignKey: 'team_id',
  as: 'public_feedbacks',
});

module.exports = {
  Admin,
  Employee,
  Complaint,
  Rating,
  Feedback,
  PasswordReset,
  ActivityLog,

  // Public models
  PublicComplaint,
  PublicRating,
  PublicFeedback,
  Department,
  Office,
  Sector,
  Division,
  Team,
  Subcity,
};
