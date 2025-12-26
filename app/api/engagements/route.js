/**
 * @swagger
 * /api/engagements:
 *   get:
 *     summary: Get all engagements
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Engagements retrieved successfully
 *   post:
 *     summary: Create new engagement
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Engagement created successfully
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { validateEngagementData } from '@/lib/validation';
import { generateEngagementId } from '@/lib/id-generator';
import { logEngagementAction } from '@/lib/audit-logger';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const client = searchParams.get('client');
    const type = searchParams.get('type');
    const channel = searchParams.get('channel');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let sql = `
      SELECT e.*, cu.customer_name, u.name as recorder_name
      FROM client_engagements e
      LEFT JOIN customers cu ON e.client_id = cu.id
      LEFT JOIN users u ON e.recorded_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (client) {
      sql += ` AND e.client_id = $${paramIndex}`;
      params.push(client);
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

    sql += ' ORDER BY e.engagement_date DESC, e.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      {
        success: true,
        data: result.rows
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/engagements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch engagements' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const user = request.user;
    const body = await request.json();

    const validation = validateEngagementData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const clientExists = await query(
      'SELECT id FROM customers WHERE id = $1',
      [body.client_id]
    );

    if (clientExists.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 400 }
      );
    }

    const engagementId = body.engagement_id || generateEngagementId();

    const result = await query(
      `INSERT INTO client_engagements (
        engagement_id, client_id, engagement_type, engagement_date,
        engagement_outcome, contact_person, recorded_by, engagement_channel,
        engagement_notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        engagementId,
        body.client_id,
        body.engagement_type,
        body.engagement_date,
        body.engagement_outcome || '',
        body.contact_person || '',
        user.userId,
        body.engagement_channel,
        body.engagement_notes || '',
      ]
    );

    const engagement = result.rows[0];

    await logEngagementAction(user.userId, 'CREATE', engagement.id, {
      engagement_id: engagementId,
      engagement_type: body.engagement_type
    });

    return NextResponse.json(
      {
        success: true,
        data: engagement,
        message: 'Engagement created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/engagements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create engagement' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return withAuth(request, getHandler);
}

export async function POST(request) {
  return withAuth(request, postHandler);
}