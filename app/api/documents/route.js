/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get documents by entity
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *   post:
 *     summary: Upload document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    let sql = `
      SELECT d.*, u.name as uploader_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (entityType) {
      sql += ` AND d.entity_type = $${paramIndex}`;
      params.push(entityType);
      paramIndex++;
    }

    if (entityId) {
      sql += ` AND d.entity_id = $${paramIndex}`;
      params.push(entityId);
      paramIndex++;
    }

    sql += ' ORDER BY d.uploaded_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      {
        success: true,
        data: result.rows
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const user = request.user;
    const body = await request.json();

    const { entityType, entityId, documentName, documentUrl } = body;

    if (!entityType || !entityId || !documentName || !documentUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO documents (
        entity_type, entity_id, document_name, document_url,
        uploaded_by, uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [entityType, entityId, documentName, documentUrl, user.userId]
    );

    const document = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        data: document,
        message: 'Document uploaded successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
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