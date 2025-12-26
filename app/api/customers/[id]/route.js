/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { validateCustomerData } from '@/lib/validation';
import { logCustomerAction } from '@/lib/audit-logger';

async function getHandler(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
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
    console.error('Error in GET /api/customers/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

async function putHandler(request, { params }) {
  try {
    const user = request.user;
    const { id } = params;
    const body = await request.json();

    const validation = validateCustomerData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const existingCustomer = await query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );

    if (existingCustomer.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    const result = await query(
      `UPDATE customers SET
        customer_name = $1,
        contact_person = $2,
        contact_number = $3,
        email_address = $4,
        industry_type = $5,
        registration_date = $6,
        customer_status = $7,
        address_line = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        body.customer_name,
        body.contact_person,
        body.contact_number,
        body.email_address,
        body.industry_type,
        body.registration_date,
        body.customer_status,
        body.address_line || '',
        id
      ]
    );

    const customer = result.rows[0];

    await logCustomerAction(user.userId, 'UPDATE', customer.id, {
      before: existingCustomer.rows[0],
      after: customer
    });

    return NextResponse.json(
      {
        success: true,
        data: customer,
        message: 'Customer updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/customers/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

async function deleteHandler(request, { params }) {
  try {
    const user = request.user;
    const { id } = params;

    const activeCases = await query(
      'SELECT id FROM cases WHERE client_id = $1 AND case_status NOT IN ($2, $3)',
      [id, 'Closed', 'Dismissed']
    );

    if (activeCases.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete customer with active cases' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    await logCustomerAction(user.userId, 'DELETE', id, {
      customer_id: result.rows[0].customer_id,
      customer_name: result.rows[0].customer_name
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Customer deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/customers/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
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