/**
 * Base repository class with common CRUD operations
 */
const { getDatabase } = require('../connection');

class BaseRepository {
  /**
   * @param {string} tableName - Database table name
   */
  constructor(tableName) {
    this.tableName = tableName;
    this.db = getDatabase();
  }

  /**
   * Get all records from the table
   * @param {object} options - Query options
   * @returns {Array} Array of records
   */
  getAll(options = {}) {
    const { where = {}, orderBy, limit, offset } = options;
    
    // Build query parts
    let query = `SELECT * FROM ${this.tableName}`;
    const params = [];
    
    // Add WHERE conditions if provided
    if (Object.keys(where).length > 0) {
      const conditions = [];
      
      for (const [key, value] of Object.entries(where)) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
      
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add ORDER BY if provided
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    
    // Add LIMIT if provided
    if (limit !== undefined) {
      query += ` LIMIT ?`;
      params.push(limit);
      
      // Add OFFSET if provided
      if (offset !== undefined) {
        query += ` OFFSET ?`;
        params.push(offset);
      }
    }
    
    // Execute query
    try {
      const stmt = this.db.prepare(query);
      return stmt.all(...params);
    } catch (error) {
      console.error(`Error executing getAll on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get a record by ID
   * @param {number|string} id - Record ID
   * @returns {object|null} Found record or null
   */
  getById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const stmt = this.db.prepare(query);
      return stmt.get(id) || null;
    } catch (error) {
      console.error(`Error executing getById on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find records by criteria
   * @param {object} criteria - Where conditions object
   * @returns {Array} Array of matching records
   */
  findBy(criteria) {
    try {
      // Build the WHERE clause
      const conditions = [];
      const params = [];
      
      for (const [key, value] of Object.entries(criteria)) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
      
      if (conditions.length === 0) {
        return this.getAll();
      }
      
      const query = `SELECT * FROM ${this.tableName} WHERE ${conditions.join(' AND ')}`;
      const stmt = this.db.prepare(query);
      
      return stmt.all(...params);
    } catch (error) {
      console.error(`Error executing findBy on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find a single record by criteria
   * @param {object} criteria - Where conditions object
   * @returns {object|null} Found record or null
   */
  findOneBy(criteria) {
    try {
      // Build the WHERE clause
      const conditions = [];
      const params = [];
      
      for (const [key, value] of Object.entries(criteria)) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
      
      if (conditions.length === 0) {
        return null;
      }
      
      const query = `SELECT * FROM ${this.tableName} WHERE ${conditions.join(' AND ')} LIMIT 1`;
      const stmt = this.db.prepare(query);
      
      return stmt.get(...params) || null;
    } catch (error) {
      console.error(`Error executing findOneBy on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   * @param {object} data - Record data
   * @returns {object} Created record with ID
   */
  create(data) {
    try {
      // Extract column names and values
      const columns = Object.keys(data);
      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map(column => data[column]);
      
      const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const stmt = this.db.prepare(query);
      
      return stmt.get(...values);
    } catch (error) {
      console.error(`Error executing create on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update a record by ID
   * @param {number|string} id - Record ID
   * @param {object} data - Record data to update
   * @returns {object} Updated record
   */
  update(id, data) {
    try {
      // Extract column names and values
      const updates = [];
      const values = [];
      
      for (const [column, value] of Object.entries(data)) {
        updates.push(`${column} = ?`);
        values.push(value);
      }
      
      // Add ID to values
      values.push(id);
      
      const query = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ? RETURNING *`;
      const stmt = this.db.prepare(query);
      
      return stmt.get(...values);
    } catch (error) {
      console.error(`Error executing update on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   * @param {number|string} id - Record ID
   * @returns {boolean} Success status
   */
  delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const stmt = this.db.prepare(query);
      const result = stmt.run(id);
      
      return result.changes > 0;
    } catch (error) {
      console.error(`Error executing delete on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete records by criteria
   * @param {object} criteria - Where conditions object
   * @returns {number} Number of deleted records
   */
  deleteBy(criteria) {
    try {
      // Build the WHERE clause
      const conditions = [];
      const params = [];
      
      for (const [key, value] of Object.entries(criteria)) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
      
      if (conditions.length === 0) {
        throw new Error('Cannot delete without criteria');
      }
      
      const query = `DELETE FROM ${this.tableName} WHERE ${conditions.join(' AND ')}`;
      const stmt = this.db.prepare(query);
      
      const result = stmt.run(...params);
      return result.changes;
    } catch (error) {
      console.error(`Error executing deleteBy on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Run a custom query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Array} Query results
   */
  query(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      return stmt.all(...params);
    } catch (error) {
      console.error(`Error executing custom query on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Execute database transaction
   * @param {Function} callback - Transaction callback
   * @returns {any} Transaction result
   */
  transaction(callback) {
    const tx = this.db.transaction(callback);
    return tx();
  }
}

module.exports = BaseRepository;
