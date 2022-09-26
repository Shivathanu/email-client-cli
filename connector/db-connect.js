import mariadb from 'mariadb';

import * as dotenv from 'dotenv';

dotenv.config();

export default class DBConnect {
    constructor() {
        this.connectionOptions = {
            connectionLimit: 10,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            user: process.env.DB_USER
        }
    }

    async executeQuery(query) {
        let connection;

        let data;

        try {
            const pool = mariadb.createPool(this.connectionOptions);

            connection = await pool.getConnection();
            data = await connection.query(query);
            delete data.meta;

            console.log('🟢 COMPLETE_SINGLE_TRANSACTION');
        } catch (err) {
            console.log('ERR_EXECUTING_QUERY:', err);
            connection.rollback();
        } finally {
            if (connection) {
                console.log('CLOSING_DB_CONNECTION');
                connection.end();
                connection.release();
                connection.close();
            }
        }

        return data;
    }

    async executeBatchQuery(query, list) {
        let connection;

        try {
            const pool = mariadb.createPool(this.connectionOptions);

            connection = await pool.getConnection();
            connection.beginTransaction();

            connection.batch(query, list);
            connection.commit();

            console.log('🟢 COMPLETE_BATCH_TRANSACTIONS');
        } catch (err) {
            console.log('🔴 ERR_EXECUTING_BATCH_QUERY:', err);
            connection.rollback();
        } finally {
            if (connection) {
                console.log('CLOSING_DB_CONNECTION');
                connection.end();
                connection.release();
                connection.close();
            }
        }
    }

    refreshInbox = async () => {
        try {
            return await Promise.all(
                [
                    this.executeQuery(`truncate table email_inbox_map;`),
                    this.executeQuery(`truncate table email_message_detail;`)
                ]
            );
        } catch {
            console.log('🔴 ERR_REFRESHING_INBOX_MAP');
        }
    }

    async createMessages(messages) {
        try {
            return await this.executeBatchQuery(`
                INSERT INTO email_inbox_map (message_id, thread_id)
                VALUES (?, ?)`,
                messages
            );
        } catch {
            console.log('🔴 ERR_INSERTING_INBOX_MAP');
        }
    }

    async createMessageDetails(messages) {
        try {
            return await this.executeBatchQuery(`
                INSERT INTO email_message_detail (thread_id, label_ids, user_id, message_from, message_to, message_subject, message, message_thread_id, received, size_estimate, history_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                messages
            );
        } catch (err) {
            console.log('ERR_INSERTING_MESSAGE_DETAIL:', err);

            throw new Error('ERR_REFRESHING_INBOX');
        }
    }
}

