import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { IUserService } from './interface/iuser-service';
import { IUserDao } from './interface/iuser-dao';

@injectable()
export class UserService implements IUserService {

  constructor(
    @inject(Symbol.for('IUserDao')) protected userDao: IUserDao
  ) { }

  async getUserContactDetails(identity: IdentityData): Promise<ContactData> {
    try {
      // Call userDao to get contact details
      const dbData = await this.userDao.getContact(identity);

      // Check if the returned data is null or undefined
      if (!dbData) {
        throw new Error(`User contact details not found for identity: ${JSON.stringify(identity)}`);
      }
      
      await this.harvest(dbData,identity);

      const contactsData = mapcontacts(dbData)

      return contactsData;
    } catch (error: any) {
      // Log and re-throw the error
      console.error(`UserService:getUserContactDetails - Error fetching user contact details: ${error.message}`);
      throw error;
    }
  }
/**
 * This function will modify the data acc to the pbl statement both in database aswell in fetched data obj from db.
 * @param contactData data that is fetched from the database
 * @param identity post params 
 */
private async harvest(contactData: DbModel[], identity: IdentityData) {
  try{
  //if no records found create one
  if (contactData.length === 0) {

    const createContact = await this.userDao.createContact("primary", identity);
    contactData.push(createContact);
  } 
  else{
    const primaryOne = contactData[0];
let emailCheck = false;
let phoneCheck = false;
let exactMatch = false;

for (let i = 0; i < contactData.length; i++) {
  const data = contactData[i];

  exactMatch = data.email === identity.email && data.phoneNumber === identity.phoneNumber;
  emailCheck = !exactMatch && !emailCheck && data.email === identity.email;
  phoneCheck = !exactMatch && !phoneCheck && data.phoneNumber === identity.phoneNumber;

  if (i > 0 && data.linkPrecedence !== 'secondary' && data.linkedId !== primaryOne.id) {
    data.linkPrecedence = 'secondary';
    data.linkedId = primaryOne.id;
    await this.userDao.updateContact(data.id, data.linkedId);
  }
}

if (!exactMatch && !(emailCheck && phoneCheck)) {
  const createContact = await this.userDao.createContact("secondary", identity, primaryOne.id);
  contactData.push(createContact);
}


  }

  }
  catch(error){
    console.error(`An error occured inside harvest: ${error}`);
  }

}

}

/**
 * maps data to the response model
 * @param dbData data that needs to be converted.
 * @returns 
 */

function mapcontacts(dbData: DbModel[]): ContactData {
  const contact: Contact = dbData.reduce<Contact>((acc, data) => {
    if (!acc.emails.includes(data.email)) {
      acc.emails.push(data.email); // Add unique emails to the array
    }

    if (!acc.phoneNumbers.includes(data.phoneNumber)) {
      acc.phoneNumbers.push(data.phoneNumber); // Add unique phone numbers to the array
    }

    if (data.linkPrecedence !== "primary" && !acc.secondaryContactIds.includes(data.id)) {
      acc.secondaryContactIds.push(data.id);
    }

    return acc;
  }, {
    primaryContactId: dbData[0]?.id,
    emails: [],
    phoneNumbers: [],
    secondaryContactIds: [],
  });

  return { contact };
}


