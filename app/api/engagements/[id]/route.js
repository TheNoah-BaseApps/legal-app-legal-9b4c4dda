/**
 * @swagger
 * /api/engagements/{id}:
 *   get:
 *     summary: Get engagement by ID
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engagement retrieved successfully
 *   put:
 *     summary: Update engagement
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engagement updated successfully
 *   delete:
 *     summary: Delete engagement
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engagement deleted successfully
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { validateEngagementData } from '@/lib/validation';
import { logEngagementAction } from '@/lib/audit-logger';

async function getHandler(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT e.*, cu.customer_name, u.name as recorder_name
       FROM client_engagements e
       LEFT JOIN customers cu ON e.client_id = cu.id
       LEFT JOIN users u ON e.recorded_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/engagements/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch engagement' },
      { status: 500 }
    );
  }
}

async function putHandler(request, { params }) {
  try {
    const user = request.user;
    const { id } = params;
    const body = await request.json();

    const validation = validateEngagementData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const existingEngagement = await query(
      'SELECT * FROM client_engagements WHERE id = $1',
      [id]
    );

    if (existingEngagement.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found' },
        { status: 404 }
      );
    }

    const result = await query(
      `UPDATE client_engagements SET
        client_id = $1,
        engagement_type = $2,
        engagement_date = $3,
        engagement_outcome = $4,
        contact_person = $5,
        engagement_channel = $6,
        engagement_notes = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *`,
      [
        body.client_id,
        body.engagement_type,
        body.engagement_date,
        body.engagement_outcome || '',
        body.contact_person || '',
        body.engagement_channel,
        body.engagement_notes || '',
        id
      ]
    );

    const engagement = result.rows[0];

    await logEngagementAction(user.userId, 'UPDATE', engagement.id, {
      before: existingEngagement.rows[0],
      after: engagement
    });

    return NextResponse.json(
      {
        success: true,
        data: engagement,
        message: 'Engagement updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/engagements/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update engagement' },
      { status: 500 }
    );
  }
}

async function deleteHandler(request, { params }) {
  try {
    const user = request.user;
    const { id } = params;

    const result = await query(
      'DELETE FROM client_engagements WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found' },
        { status: 404 }
      );
    }

    await logEngagementAction(user.userId, 'DELETE', id, {
      engagement_id: result.rows[0].engagement_id,
      engagement_type: result.rows[0].engagement_type
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Engagement deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/engagements/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete engagement' },
      { status: 500 }
    );
  }
}

export async function GET(request, context) {
  return withAuth(request, (req) => getHandler(req, context));
}

export async function PUT(request, context) {
  return withAuth(request, (req) => putHandler(req, context));
}

export async function DELETE(request, context) {
  return withAuth(request, (req) => deleteHandler(req, context));
}