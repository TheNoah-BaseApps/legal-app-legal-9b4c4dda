import { query, getClient } from '@/lib/database/aurora';

export { query, getClient };

export async function executeTransaction(operations) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const operation of operations) {
      const result = await client.query(operation.sql, operation.params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function findOne(table, conditions = {}, columns = '*') {
  try {
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(conditions);
    
    const sql = `SELECT ${columns} FROM ${table}${whereClause ? ` WHERE ${whereClause}` : ''} LIMIT 1`;
    const result = await query(sql, values);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error finding one in ${table}:`, error);
    throw error;
  }
}

export async function findMany(table, conditions = {}, options = {}) {
  try {
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(conditions);
    
    const { orderBy = 'created_at DESC', limit, offset } = options;
    
    let sql = `SELECT * FROM ${table}${whereClause ? ` WHERE ${whereClause}` : ''}`;
    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    if (limit) sql += ` LIMIT ${limit}`;
    if (offset) sql += ` OFFSET ${offset}`;
    
    const result = await query(sql, values);
    return result.rows;
  } catch (error) {
    console.error(`Error finding many in ${table}:`, error);
    throw error;
  }
}

export async function insertOne(table, data) {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await query(sql, values);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw error;
  }
}

export async function updateOne(table, conditions, data) {
  try {
    const dataKeys = Object.keys(data);
    const conditionKeys = Object.keys(conditions);
    
    const setClause = dataKeys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const whereClause = conditionKeys.map((key, index) => `${key} = $${dataKeys.length + index + 1}`).join(' AND ');
    
    const values = [...Object.values(data), ...Object.values(conditions)];
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    const result = await query(sql, values);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
}

export async function deleteOne(table, conditions) {
  try {
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(conditions);
    
    const sql = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
    const result = await query(sql, values);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
}