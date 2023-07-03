import * as aws from 'aws-sdk';
import { Configs } from './Configs';

export class SecretManager {
  /**
    * This method returns all the values for the specific id.
    * @param secretId Secret id of the secret manager
    * @returns All the key value pair json for the specific secret id.
  */
 private static async getSecret(secretId: string): Promise<any> {
    const client = new aws.SecretsManager({ region: 'us-east-1' });
    return new Promise<any>((resolve, reject): void => {
      client.getSecretValue({ SecretId: secretId }, (err: any, data: any): void => {
        if (err) return reject(err);
        if (!data.SecretString) return reject("Error: SecretString not found");
        resolve(data.SecretString);
      });
    });
  }

 static async setDbConfig() {
    const dbArn = process.env.DB_ARN || '';
    const secretResponse = await SecretManager.getSecret(dbArn);
    const secretValue = JSON.parse(secretResponse|| '{}');
    Configs.USERNAME = secretValue.username;
    Configs.PASSWORD = secretValue.password;
  }
  
}


