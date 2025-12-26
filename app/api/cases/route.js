/**
 * @swagger
 * /api/cases:
 *   get:
 *     summary: Get all cases
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: attorney
 *         schema:
 *           type: string
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cases retrieved successfully
 *   post:
 *     summary: Create new case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Case created successfully
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { validateCaseData } from '@/lib/validation';
import { generateCaseId } from '@/lib/id-generator';
import { logCaseAction } from '@/lib/audit-logger';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const attorney = searchParams.get('attorney');
    const client = searchParams.get('client');
    const search = searchParams.get('search');

    let sql = `
      SELECT c.*, cu.customer_name, u.name as attorney_name
      FROM cases c
      LEFT JOIN customers cu ON c.client_id = cu.id
      LEFT JOIN users u ON c.assigned_attorney = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND c.case_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (attorney) {
      sql += ` AND c.assigned_attorney = $${paramIndex}`;
      params.push(attorney);
      paramIndex++;
    }

    if (client) {
      sql += ` AND c.client_id = $${paramIndex}`;
      params.push(client);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (c.case_title ILIKE $${paramIndex} OR c.case_id ILIKE $${paramIndex} OR cu.customer_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY c.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      {
        success: true,
        data: result.rows
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/cases:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const user = request.user;
    const body = await request.json();

    const validation = validateCaseData(body);
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

    const caseId = body.case_id || generateCaseId();

    const existingCase = await query(
      'SELECT id FROM cases WHERE case_id = $1',
      [caseId]
    );

    if (existingCase.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Case ID already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO cases (
        case_id, case_title, client_id, case_type, case_status,
        assigned_attorney, filing_date, court_name, hearing_date,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [
        caseId,
        body.case_title,
        body.client_id,
        body.case_type,
        body.case_status || 'New',
        body.assigned_attorney || null,
        body.filing_date || null,
        body.court_name || '',
        body.hearing_date || null,
        user.userId
      ]
    );

    const caseData = result.rows[0];

    await logCaseAction(user.userId, 'CREATE', caseData.id, {
      case_id: caseId,
      case_title: body.case_title
    });

    return NextResponse.json(
      {
        success: true,
        data: caseData,
        message: 'Case created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/cases:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create case' },
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