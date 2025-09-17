/**
 * =====================================
 * COMPLAINT HIERARCHY CONTROLLER
 * =====================================
 * Controller for managing complaints with organizational hierarchy filtering
 */

const { Op } = require('sequelize');
const { Complaint, PublicComplaint, Sector, Division, Department, Team } = require('../models');

const complaintHierarchyController = {
  // =====================================
  // COMPLAINTS BY SECTOR
  // =====================================

  getComplaintsBySector: async (req, res) => {
    try {
      const { sectorId } = req.params;
      const { page = 1, limit = 10, status, type = 'all' } = req.query;

      // Validate sector exists
      const sector = await Sector.findByPk(sectorId);
      if (!sector) {
        return res.status(404).json({
          success: false,
          message: 'Sector not found',
        });
      }

      const offset = (page - 1) * limit;
      const whereClause = { sector_id: sectorId };

      if (status) {
        whereClause.status = status;
      }

      let complaints = [];
      let totalCount = 0;

      if (type === 'internal' || type === 'all') {
        const internalComplaints = await Complaint.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']],
          include: [
            {
              model: Sector,
              as: 'sector',
              attributes: ['id', 'name_en', 'name_af', 'name_am'],
            },
            {
              model: Division,
              as: 'division',
              attributes: ['id', 'name'],
            },
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name'],
            },
            {
              model: Team,
              as: 'team',
              attributes: ['id', 'name'],
            },
          ],
        });

        complaints = [
          ...complaints,
          ...internalComplaints.rows.map((c) => ({
            ...c.toJSON(),
            complaint_type: 'internal',
          })),
        ];
        totalCount += internalComplaints.count;
      }

      if (type === 'public' || type === 'all') {
        const publicComplaints = await PublicComplaint.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']],
          include: [
            {
              model: Sector,
              as: 'sector',
              attributes: ['id', 'name_en', 'name_am', 'name_af'],
            },
            {
              model: Division,
              as: 'division',
              attributes: ['id', 'name'],
            },
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name'],
            },
            {
              model: Team,
              as: 'team',
              attributes: ['id', 'name'],
            },
          ],
        });

        complaints = [
          ...complaints,
          ...publicComplaints.rows.map((c) => ({
            ...c.toJSON(),
            complaint_type: 'public',
          })),
        ];
        totalCount += publicComplaints.count;
      }

      // Sort combined results by created_at
      complaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.json({
        success: true,
        data: {
          complaints,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: totalCount,
            total_pages: Math.ceil(totalCount / limit),
          },
          sector: {
            id: sector.id,
            name: sector.name,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching complaints by sector:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching complaints by sector',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // =====================================
  // COMPLAINTS BY DIVISION
  // =====================================

  getComplaintsByDivision: async (req, res) => {
    try {
      const { divisionId } = req.params;
      const { page = 1, limit = 10, status, type = 'all' } = req.query;

      // Validate division exists
      const division = await Division.findByPk(divisionId, {
        include: [
          { model: Sector, as: 'sector', attributes: ['id', 'name_en', 'name_am', 'name_af'] },
        ],
      });

      if (!division) {
        return res.status(404).json({
          success: false,
          message: 'Division not found',
        });
      }

      const offset = (page - 1) * limit;
      const whereClause = { division_id: divisionId };

      if (status) {
        whereClause.status = status;
      }

      let complaints = [];
      let totalCount = 0;

      if (type === 'internal' || type === 'all') {
        const internalComplaints = await Complaint.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']],
        });

        complaints = [
          ...complaints,
          ...internalComplaints.rows.map((c) => ({
            ...c.toJSON(),
            complaint_type: 'internal',
          })),
        ];
        totalCount += internalComplaints.count;
      }

      if (type === 'public' || type === 'all') {
        const publicComplaints = await PublicComplaint.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']],
        });

        complaints = [
          ...complaints,
          ...publicComplaints.rows.map((c) => ({
            ...c.toJSON(),
            complaint_type: 'public',
          })),
        ];
        totalCount += publicComplaints.count;
      }

      // Sort combined results by created_at
      complaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.json({
        success: true,
        data: {
          complaints,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: totalCount,
            total_pages: Math.ceil(totalCount / limit),
          },
          division: {
            id: division.id,
            name: division.name,
            sector: division.sector,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching complaints by division:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching complaints by division',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // =====================================
  // COMPLAINTS BY DEPARTMENT
  // =====================================

  getComplaintsByDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;
      const { page = 1, limit = 10, status, type = 'all' } = req.query;

      // Validate department exists
      const department = await Department.findByPk(departmentId, {
        include: [
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
            include: [{ model: Sector, as: 'sector', attributes: ['id', 'name'] }],
          },
        ],
      });

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found',
        });
      }

      const offset = (page - 1) * limit;
      const whereClause = { department_id: departmentId };

      if (status) {
        whereClause.status = status;
      }

      let complaints = [];
      let totalCount = 0;

      if (type === 'internal' || type === 'all') {
        const internalComplaints = await Complaint.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']],
        });

        complaints = [
          ...complaints,
          ...internalComplaints.rows.map((c) => ({
            ...c.toJSON(),
            complaint_type: 'internal',
          })),
        ];
        totalCount += internalComplaints.count;
      }

      if (type === 'public' || type === 'all') {
        const publicComplaints = await PublicComplaint.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']],
        });

        complaints = [
          ...complaints,
          ...publicComplaints.rows.map((c) => ({
            ...c.toJSON(),
            complaint_type: 'public',
          })),
        ];
        totalCount += publicComplaints.count;
      }

      // Sort combined results by created_at
      complaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.json({
        success: true,
        data: {
          complaints,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: totalCount,
            total_pages: Math.ceil(totalCount / limit),
          },
          department: {
            id: department.id,
            name: department.name,
            division: department.division,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching complaints by department:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching complaints by department',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // =====================================
  // COMPLAINTS BY TEAM
  // =====================================

  getComplaintsByTeam: async (req, res) => {
    try {
      const { teamId } = req.params;
      const { page = 1, limit = 10, status, type = 'all' } = req.query;

      // Validate team exists
      const team = await Team.findByPk(teamId, {
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name'],
            include: [
              {
                model: Division,
                as: 'division',
                attributes: ['id', 'name'],
                include: [{ model: Sector, as: 'sector', attributes: ['id', 'name'] }],
              },
            ],
          },
        ],
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found',
        });
      }

      const offset = (page - 1) * limit;
      const whereClause = { team_id: teamId };

      if (status) {
        whereClause.status = status;
      }

      let complaints = [];
      let totalCount = 0;

      if (type === 'internal' || type === 'all') {
        const internalComplaints = await Complaint.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']],
        });

        complaints = [
          ...complaints,
          ...internalComplaints.rows.map((c) => ({
            ...c.toJSON(),
            complaint_type: 'internal',
          })),
        ];
        totalCount += internalComplaints.count;
      }

      if (type === 'public' || type === 'all') {
        const publicComplaints = await PublicComplaint.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']],
        });

        complaints = [
          ...complaints,
          ...publicComplaints.rows.map((c) => ({
            ...c.toJSON(),
            complaint_type: 'public',
          })),
        ];
        totalCount += publicComplaints.count;
      }

      // Sort combined results by created_at
      complaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.json({
        success: true,
        data: {
          complaints,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: totalCount,
            total_pages: Math.ceil(totalCount / limit),
          },
          team: {
            id: team.id,
            name: team.name,
            department: team.department,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching complaints by team:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching complaints by team',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },
};

module.exports = complaintHierarchyController;
