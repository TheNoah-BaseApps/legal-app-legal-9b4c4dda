import { query } from './db';

export async function logAuditEvent(event) {
  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      changes = null,
      ipAddress = null,
      userAgent = null
    } = event;

    const sql = `
      INSERT INTO audit_logs (
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        changes, 
        ip_address, 
        user_agent,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      userId,
      action,
      entityType,
      entityId,
      changes ? JSON.stringify(changes) : null,
      ipAddress,
      userAgent
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error logging audit event:', error);
    return null;
  }
}

export async function logCustomerAction(userId, action, customerId, changes = null) {
  return logAuditEvent({
    userId,
    action,
    entityType: 'customer',
    entityId: customerId,
    changes
  });
}

export async function logCaseAction(userId, action, caseId, changes = null) {
  return logAuditEvent({
    userId,
    action,
    entityType: 'case',
    entityId: caseId,
    changes
  });
}

export async function logEngagementAction(userId, action, engagementId, changes = null) {
  return logAuditEvent({
    userId,
    action,
    entityType: 'engagement',
    entityId: engagementId,
    changes
  });
}

export async function getAuditLogs(filters = {}) {
  try {
    const { entityType, entityId, userId, startDate, endDate, limit = 100 } = filters;
    
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (entityType) {
      sql += ` AND entity_type = $${paramIndex}`;
      params.push(entityType);
      paramIndex++;
    }

    if (entityId) {
      sql += ` AND entity_id = $${paramIndex}`;
      params.push(entityId);
      paramIndex++;
    }

    if (userId) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (startDate) {
      sql += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT ${limit}`;

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}