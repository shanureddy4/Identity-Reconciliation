import { IUserService } from './interface/iuser-service';
import { UserDetailsIOC } from './user-loader';
import { SecretManager } from '../aws/secret-manager';

exports.handler = async function (event: any) {
  try {

    console.log("event log",event);
    // parse the event body to JSON format
    const identityData: IdentityData = JSON.parse(event.body);

    if (identityData == null || (!identityData.email && !identityData.phoneNumber)) {
        throw new Error("Please provide at least email or phone number");
    }


    // assign environment variables
    await SecretManager.setDbConfig()

    // call the getUserContactDetails method on the UserService instance
    const userService = UserDetailsIOC.getContainer().get<IUserService>(Symbol.for('IUserService'));
    const contactData = await userService.getUserContactDetails(identityData);

    // return the contactData as the response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ contactData})
    };
  } catch (error: any) {
    console.error(`getUserContactDetailsHandler - Error fetching user contact details: ${error.message}`);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
