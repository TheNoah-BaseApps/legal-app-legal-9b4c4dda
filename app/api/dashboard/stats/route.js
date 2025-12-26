/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';

async function handler(request) {
  try {
    const totalCustomersResult = await query(
      'SELECT COUNT(*) as count FROM customers'
    );
    const totalCustomers = parseInt(totalCustomersResult.rows[0].count);

    const activeCustomersResult = await query(
      "SELECT COUNT(*) as count FROM customers WHERE customer_status = 'Active'"
    );
    const activeCustomers = parseInt(activeCustomersResult.rows[0].count);

    const totalCasesResult = await query(
      'SELECT COUNT(*) as count FROM cases'
    );
    const totalCases = parseInt(totalCasesResult.rows[0].count);

    const activeCasesResult = await query(
      "SELECT COUNT(*) as count FROM cases WHERE case_status IN ('New', 'Open', 'In Progress', 'Pending')"
    );
    const activeCases = parseInt(activeCasesResult.rows[0].count);

    const closedCasesResult = await query(
      "SELECT COUNT(*) as count FROM cases WHERE case_status IN ('Closed', 'Dismissed')"
    );
    const closedCases = parseInt(closedCasesResult.rows[0].count);

    const totalEngagementsResult = await query(
      'SELECT COUNT(*) as count FROM client_engagements'
    );
    const totalEngagements = parseInt(totalEngagementsResult.rows[0].count);

    const thisMonthEngagementsResult = await query(
      `SELECT COUNT(*) as count FROM client_engagements 
       WHERE EXTRACT(MONTH FROM engagement_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM engagement_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );
    const thisMonthEngagements = parseInt(thisMonthEngagementsResult.rows[0].count);

    const upcomingHearingsResult = await query(
      `SELECT c.*, cu.customer_name, u.name as attorney_name
       FROM cases c
       LEFT JOIN customers cu ON c.client_id = cu.id
       LEFT JOIN users u ON c.assigned_attorney = u.id
       WHERE c.hearing_date >= CURRENT_DATE
       AND c.hearing_date <= CURRENT_DATE + INTERVAL '30 days'
       ORDER BY c.hearing_date ASC
       LIMIT 10`
    );
    const upcomingHearings = upcomingHearingsResult.rows;

    const casesByStatusResult = await query(
      `SELECT case_status, COUNT(*) as count
       FROM cases
       GROUP BY case_status
       ORDER BY count DESC`
    );
    const casesByStatus = casesByStatusResult.rows;

    const recentActivityResult = await query(
      `(SELECT 'customer' as type, customer_id as ref_id, customer_name as title, created_at
        FROM customers
        ORDER BY created_at DESC
        LIMIT 5)
       UNION ALL
       (SELECT 'case' as type, case_id as ref_id, case_title as title, created_at
        FROM cases
        ORDER BY created_at DESC
        LIMIT 5)
       UNION ALL
       (SELECT 'engagement' as type, engagement_id as ref_id, engagement_type as title, created_at
        FROM client_engagements
        ORDER BY created_at DESC
        LIMIT 5)
       ORDER BY created_at DESC
       LIMIT 10`
    );
    const recentActivity = recentActivityResult.rows;

    return NextResponse.json(
      {
        success: true,
        data: {
          customers: {
            total: totalCustomers,
            active: activeCustomers,
            inactive: totalCustomers - activeCustomers
          },
          cases: {
            total: totalCases,
            active: activeCases,
            closed: closedCases
          },
          engagements: {
            total: totalEngagements,
            thisMonth: thisMonthEngagements
          },
          upcomingHearings,
          casesByStatus,
          recentActivity
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/dashboard/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return withAuth(request, handler);
}