/**
 * @swagger
 * /api/reports/engagements:
 *   get:
 *     summary: Generate engagement reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';

async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const channel = searchParams.get('channel');
    const client = searchParams.get('client');

    let sql = `
      SELECT 
        e.*,
        cu.customer_name,
        cu.industry_type,
        u.name as recorder_name
      FROM client_engagements e
      LEFT JOIN customers cu ON e.client_id = cu.id
      LEFT JOIN users u ON e.recorded_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      sql += ` AND e.engagement_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND e.engagement_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (type) {
      sql += ` AND e.engagement_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (channel) {
      sql += ` AND e.engagement_channel = $${paramIndex}`;
      params.push(channel);
      paramIndex++;
    }

    if (client) {
      sql += ` AND e.client_id = $${paramIndex}`;
      params.push(client);
      paramIndex++;
    }

    sql += ' ORDER BY e.engagement_date DESC, e.created_at DESC';

    const result = await query(sql, params);

    const summaryByTypeResult = await query(
      `SELECT 
        engagement_type,
        COUNT(*) as count
       FROM client_engagements
       WHERE 1=1
       ${startDate ? `AND engagement_date >= '${startDate}'` : ''}
       ${endDate ? `AND engagement_date <= '${endDate}'` : ''}
       GROUP BY engagement_type
       ORDER BY count DESC`
    );

    const summaryByChannelResult = await query(
      `SELECT 
        engagement_channel,
        COUNT(*) as count
       FROM client_engagements
       WHERE 1=1
       ${startDate ? `AND engagement_date >= '${startDate}'` : ''}
       ${endDate ? `AND engagement_date <= '${endDate}'` : ''}
       GROUP BY engagement_channel
       ORDER BY count DESC`
    );

    const summaryByOutcomeResult = await query(
      `SELECT 
        engagement_outcome,
        COUNT(*) as count
       FROM client_engagements
       WHERE engagement_outcome IS NOT NULL AND engagement_outcome != ''
       ${startDate ? `AND engagement_date >= '${startDate}'` : ''}
       ${endDate ? `AND engagement_date <= '${endDate}'` : ''}
       GROUP BY engagement_outcome
       ORDER BY count DESC`
    );

    const topClientsResult = await query(
      `SELECT 
        cu.customer_name,
        cu.id,
        COUNT(e.id) as engagement_count
       FROM customers cu
       LEFT JOIN client_engagements e ON e.client_id = cu.id
       WHERE 1=1
       ${startDate ? `AND e.engagement_date >= '${startDate}'` : ''}
       ${endDate ? `AND e.engagement_date <= '${endDate}'` : ''}
       GROUP BY cu.id, cu.customer_name
       ORDER BY engagement_count DESC
       LIMIT 10`
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          engagements: result.rows,
          summaryByType: summaryByTypeResult.rows,
          summaryByChannel: summaryByChannelResult.rows,
          summaryByOutcome: summaryByOutcomeResult.rows,
          topClients: topClientsResult.rows
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/reports/engagements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate engagement report' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return withAuth(request, handler);
}