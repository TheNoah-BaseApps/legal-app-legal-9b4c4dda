/**
 * @swagger
 * /api/cases/{id}:
 *   get:
 *     summary: Get case by ID
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Case retrieved successfully
 *   put:
 *     summary: Update case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Case updated successfully
 *   delete:
 *     summary: Delete case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Case deleted successfully
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { validateCaseData } from '@/lib/validation';
import { logCaseAction } from '@/lib/audit-logger';
import { isFutureDate } from '@/lib/date-validator';

async function getHandler(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT c.*, cu.customer_name, u.name as attorney_name
       FROM cases c
       LEFT JOIN customers cu ON c.client_id = cu.id
       LEFT JOIN users u ON c.assigned_attorney = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
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
    console.error('Error in GET /api/cases/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch case' },
      { status: 500 }
    );
  }
}

async function putHandler(request, { params }) {
  try {
    const user = request.user;
    const { id } = params;
    const body = await request.json();

    const validation = validateCaseData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const existingCase = await query(
      'SELECT * FROM cases WHERE id = $1',
      [id]
    );

    if (existingCase.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    if (body.assigned_attorney) {
      const attorneyExists = await query(
        'SELECT id, role FROM users WHERE id = $1',
        [body.assigned_attorney]
      );

      if (attorneyExists.rows.length === 0 || attorneyExists.rows[0].role !== 'Attorney') {
        return NextResponse.json(
          { success: false, error: 'Invalid attorney assignment' },
          { status: 400 }
        );
      }
    }

    const result = await query(
      `UPDATE cases SET
        case_title = $1,
        client_id = $2,
        case_type = $3,
        case_status = $4,
        assigned_attorney = $5,
        filing_date = $6,
        court_name = $7,
        hearing_date = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        body.case_title,
        body.client_id,
        body.case_type,
        body.case_status,
        body.assigned_attorney || null,
        body.filing_date || null,
        body.court_name || '',
        body.hearing_date || null,
        id
      ]
    );

    const caseData = result.rows[0];

    await logCaseAction(user.userId, 'UPDATE', caseData.id, {
      before: existingCase.rows[0],
      after: caseData
    });

    return NextResponse.json(
      {
        success: true,
        data: caseData,
        message: 'Case updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/cases/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update case' },
      { status: 500 }
    );
  }
}

async function deleteHandler(request, { params }) {
  try {
    const user = request.user;
    const { id } = params;

    const existingCase = await query(
      'SELECT * FROM cases WHERE id = $1',
      [id]
    );

    if (existingCase.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    const caseData = existingCase.rows[0];

    if (caseData.hearing_date && isFutureDate(caseData.hearing_date)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete case with future hearing date' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM cases WHERE id = $1 RETURNING *',
      [id]
    );

    await logCaseAction(user.userId, 'DELETE', id, {
      case_id: caseData.case_id,
      case_title: caseData.case_title
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Case deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/cases/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete case' },
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