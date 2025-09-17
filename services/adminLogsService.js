const { ActivityLog } = require('../models');

class ActivityLogService {
  // Log creation with additional fields
  static async logCreate(
    entityType,
    entityId,
    adminId = null,
    details = null,
    sectorId = null,
    subcityId = null
  ) {
    try {
      await ActivityLog.create({
        admin_id: adminId,
        action: 'CREATE',
        entity_type: entityType,
        entity_id: entityId,
        details: details,
        sector_id: sectorId,
        subcity_id: subcityId,
      });
      console.log(`✅ Logged CREATE ${entityType} #${entityId}`);
    } catch (error) {
      console.error('Error logging creation:', error);
    }
  }

  // Log update with additional fields
  static async logUpdate(
    entityType,
    entityId,
    adminId = null,
    details = null,
    sectorId = null,
    subcityId = null
  ) {
    try {
      await ActivityLog.create({
        admin_id: adminId,
        action: 'UPDATE',
        entity_type: entityType,
        entity_id: entityId,
        details: details,
        sector_id: sectorId,
        subcity_id: subcityId,
      });
      console.log(`✅ Logged UPDATE ${entityType} #${entityId}`);
    } catch (error) {
      console.error('Error logging update:', error);
    }
  }

  // Log deletion with additional fields
  static async logDelete(
    entityType,
    entityId,
    adminId = null,
    details = null,
    sectorId = null,
    subcityId = null
  ) {
    try {
      await ActivityLog.create({
        admin_id: adminId,
        action: 'DELETE',
        entity_type: entityType,
        entity_id: entityId,
        details: details,
        sector_id: sectorId,
        subcity_id: subcityId,
      });
      console.log(`✅ Logged DELETE ${entityType} #${entityId}`);
    } catch (error) {
      console.error('Error logging deletion:', error);
    }
  }

  // Generic log method for custom actions
  static async logCustom(
    action,
    entityType,
    entityId,
    adminId = null,
    details = null,
    sectorId = null,
    subcityId = null
  ) {
    try {
      await ActivityLog.create({
        admin_id: adminId,
        action: action,
        entity_type: entityType,
        entity_id: entityId,
        details: details,
        sector_id: sectorId,
        subcity_id: subcityId,
      });
      console.log(`✅ Logged ${action} ${entityType} #${entityId}`);
    } catch (error) {
      console.error('Error logging custom action:', error);
    }
  }
}

module.exports = ActivityLogService;
