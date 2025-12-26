/**
 * @swagger
 * /api/reports/cases:
 *   get:
 *     summary: Generate case reports
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
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: attorney
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
    const status = searchParams.get('status');
    const attorney = searchParams.get('attorney');
    const caseType = searchParams.get('caseType');

    let sql = `
      SELECT 
        c.*,
        cu.customer_name,
        cu.industry_type,
        u.name as attorney_name,
        COUNT(DISTINCT e.id) as engagement_count
      FROM cases c
      LEFT JOIN customers cu ON c.client_id = cu.id
      LEFT JOIN users u ON c.assigned_attorney = u.id
      LEFT JOIN client_engagements e ON e.client_id = c.client_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      sql += ` AND c.filing_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND c.filing_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

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

    if (caseType) {
      sql += ` AND c.case_type = $${paramIndex}`;
      params.push(caseType);
      paramIndex++;
    }

    sql += ` GROUP BY c.id, cu.customer_name, cu.industry_type, u.name
             ORDER BY c.filing_date DESC`;

    const result = await query(sql, params);

    const summaryResult = await query(
      `SELECT 
        case_status,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE hearing_date IS NOT NULL) as with_hearings
       FROM cases
       WHERE 1=1
       ${startDate ? `AND filing_date >= '${startDate}'` : ''}
       ${endDate ? `AND filing_date <= '${endDate}'` : ''}
       GROUP BY case_status`
    );

    const attorneyWorkloadResult = await query(
      `SELECT 
        u.name,
        u.id,
        COUNT(c.id) as total_cases,
        COUNT(c.id) FILTER (WHERE c.case_status NOT IN ('Closed', 'Dismissed')) as active_cases
       FROM users u
       LEFT JOIN cases c ON c.assigned_attorney = u.id
       WHERE u.role = 'Attorney'
       GROUP BY u.id, u.name
       ORDER BY active_cases DESC`
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          cases: result.rows,
          summary: summaryResult.rows,
          attorneyWorkload: attorneyWorkloadResult.rows
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/reports/cases:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate case report' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return withAuth(request, handler);
}