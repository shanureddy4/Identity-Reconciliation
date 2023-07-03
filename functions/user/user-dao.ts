import { executeQuery} from "./db-config";
import { injectable } from 'inversify';
import { IUserDao } from "./interface/iuser-dao";
import { Configs } from "../aws/Configs";

@injectable()
export class UserDao implements IUserDao {

  /**
   * gets all the records that will match either to phoneNumber or email and primary records for fetched records.
   * @param identity props from post call encloses email and phoneNumber
   * @returns 
   */
  async getContact(identity: IdentityData): Promise<DbModel[]> {
    try {

        const getIdsQuery = `SELECT id, linkedId FROM ${Configs.DB_NAME}.UserContacts WHERE (phoneNumber = ? OR email = ?);`;
        const result = await executeQuery(getIdsQuery, [identity.phoneNumber, identity.email]) as {id: number, linkedId: number}[];

        const allIdsAndLinkedIds = result.map(({ id, linkedId }) => [id, linkedId]).flat();
        if (allIdsAndLinkedIds.length === 0) {
          console.log('No records found.');
          return [];
        } 
        const query = `SELECT * FROM ${Configs.DB_NAME}.UserContacts WHERE linkedId IN (?) OR id IN (?) ORDER BY createdAt ASC;`;
        const results = await executeQuery(query, [allIdsAndLinkedIds, allIdsAndLinkedIds]) as DbModel[];

      console.log('Query results:', results);
      return results;
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('getContact: Failed to get contacts');
    }
  }
  /**
   * creates the new contact and return that
   * @param linkPrecedence precedence -> if other records existed then it will create precedence accngly
   * @param identity props from post call to insert new contact
   * @param linkedId if it's a secondary we will add this linkedId
   * @returns 
   */
 async createContact(linkPrecedence: string, identity: IdentityData, linkedId?: number): Promise<DbModel> {
  try {
    const insertQuery = `INSERT INTO ${Configs.DB_NAME}.UserContacts (linkPrecedence, email, phoneNumber, linkedId) VALUES (?, ?, ?, ?)`;
    const selectQuery = `SELECT * FROM ${Configs.DB_NAME}.UserContacts WHERE id = LAST_INSERT_ID()`;

    await executeQuery(insertQuery, [linkPrecedence, identity.email, identity.phoneNumber, linkedId || null]);
    const results = await executeQuery(selectQuery) as DbModel[];
    
    console.log('Query results from createContact:', results);
    return results[0];
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error('createContact: Failed to get contacts');
  }
}


  /**
   * update the contacts
   * @param id id of the secondary contact 
   * @param linkedID id of the primary contact
   */
  async updateContact(id:number,linkedID:number): Promise<void> {
    try {
      const query = `UPDATE ${Configs.DB_NAME}.UserContacts SET linkPrecedence = ? , linkedId = ? WHERE id = ?;`;
      await executeQuery(query,['secondary',linkedID , id]);
      console.log('Updated contact');
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('updateContacts : Failed to update contacts');
    }
  }

  
}
