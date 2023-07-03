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

    //checks to create a new contact if it's not there
    let emailCheck = false;
    let phoneCheck = false;
    let exactMatch = false;
   

    contactData.forEach(async (data:DbModel,index:number)=>{

      //checks if it is an exact match. so that won't create a new contact
      exactMatch = data.email===identity.email && data.phoneNumber === identity.phoneNumber;

      //checks exactMatch so that short circuit before validating further.
      emailCheck = !exactMatch && !emailCheck && data.email === identity.email;
      phoneCheck = !exactMatch && !phoneCheck && data.phoneNumber === identity.phoneNumber;

      //the data is fetched in a way where first record is always primary so updating rest if there is any
      if(index>0 && data.linkPrecedence !== 'secondary' && data.linkedId !== primaryOne.id){
        data.linkPrecedence = 'secondary';
        data.linkedId = primaryOne.id;
        //for better code readability updating both linkPrecedence even for secondary. 
        //if data is huge we can wrap then in another if condtion and make the changes.
        await this.userDao.updateContact(data.id,data.linkedId)
      }

   })
   if(!exactMatch && !(emailCheck && phoneCheck)){
    //this will create a new contact even any one of email or phoneNumber is null or empty string.
    const createContact = await this.userDao.createContact("secondary", identity , primaryOne.id);
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

    if (data.linkPrecedence !== "primary") {
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


