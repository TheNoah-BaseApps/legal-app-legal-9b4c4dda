/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *   post:
 *     summary: Create new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Customer created successfully
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { validateCustomerData } from '@/lib/validation';
import { generateCustomerId } from '@/lib/id-generator';
import { logCustomerAction } from '@/lib/audit-logger';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND customer_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (industry) {
      sql += ` AND industry_type = $${paramIndex}`;
      params.push(industry);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (customer_name ILIKE $${paramIndex} OR contact_person ILIKE $${paramIndex} OR email_address ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      {
        success: true,
        data: result.rows
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const user = request.user;
    const body = await request.json();

    const validation = validateCustomerData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const customerId = body.customer_id || generateCustomerId();

    const existingCustomer = await query(
      'SELECT id FROM customers WHERE customer_id = $1',
      [customerId]
    );

    if (existingCustomer.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Customer ID already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO customers (
        customer_id, customer_name, contact_person, contact_number,
        email_address, industry_type, registration_date, customer_status,
        address_line, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [
        customerId,
        body.customer_name,
        body.contact_person,
        body.contact_number,
        body.email_address,
        body.industry_type,
        body.registration_date || new Date().toISOString().split('T')[0],
        body.customer_status || 'Active',
        body.address_line || '',
        user.userId
      ]
    );

    const customer = result.rows[0];

    await logCustomerAction(user.userId, 'CREATE', customer.id, {
      customer_id: customerId,
      customer_name: body.customer_name
    });

    return NextResponse.json(
      {
        success: true,
        data: customer,
        message: 'Customer created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
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