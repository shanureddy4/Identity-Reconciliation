import * as mysql from 'mysql';
import { Configs } from '../aws/Configs';

let pool:mysql.Pool;


export const executeQuery = (sql: string, args?: any[]): Promise<any> => {
  InitPool();
  return new Promise((resolve, reject) => {
    pool.getConnection((err: mysql.MysqlError, connection: mysql.PoolConnection) => {
      if (err) {
        reject(`error with the connection ${err} `);
        return;
      }
      connection.query(sql, args, (error: mysql.MysqlError | null, results: any[]) => {
        connection.release();
        if (error) {
          if(error.code === 'ER_NO_SUCH_TABLE'){
            console.log("Table does not exist creating one");
            createTable();
          }
          reject(`error with the query ${error} `);
          return;
        }
        resolve(results);
      });
    });
  });
};

function InitPool() {
  if(!pool){
    console.log("pool created");
    pool = mysql.createPool({
      host: Configs.DB_HOST,
      database: Configs.DB_NAME,
      user: Configs.USERNAME,
      password: Configs.PASSWORD
    });
  }
}

/**
 * creating new table if it does not exist.
 */
function createTable() {
  const query = `CREATE TABLE ${Configs.DB_NAME}.UserContacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phoneNumber VARCHAR(255),
    email VARCHAR(255),
    linkedId INT,
    linkPrecedence ENUM('secondary', 'primary'),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME
  );`
  executeQuery(query);
}
