import { UserService } from '../functions/user/user-service';
import { IUserService } from '../functions/user/interface/iuser-service';
import { IUserDao } from '../functions/user/interface/iuser-dao';

describe('UserService', () => {
  let userService: IUserService;
  let userDaoMock: jest.Mocked<IUserDao>;

  beforeEach(() => {
    userDaoMock = {
      getContact: jest.fn(),
    } as jest.Mocked<IUserDao>;

    userService = new UserService(userDaoMock);
  });

  describe('getUserContactDetails', () => {
    it('should return user contact details for a valid identity', async () => {
      const identity:IdentityData = { email: 'validId' , phoneNumber :901009053 };
      const contactData:ContactData = {
        contact:{
            primaryContactId: 1,
            emails: ["sj","S"],
            phoneNumbers: ["sj","S"],
            secondaryContactIds: [1,2] 
        }

    };
      userDaoMock.getContact.mockResolvedValueOnce(contactData);

      const result = await userService.getUserContactDetails(identity);

      expect(result).toEqual(contactData);
      expect(userDaoMock.getContact).toHaveBeenCalledWith(identity);
    });

    it('should throw an error for an invalid identity', async () => {
      const identity = { email: 'invalidId' , phoneNumber :901009053  };
      userDaoMock.getContact.mockResolvedValueOnce(null as unknown as ContactData);

      await expect(userService.getUserContactDetails(identity)).rejects.toThrowError(
        new Error(`User contact details not found for identity: ${JSON.stringify(identity)}`)
      );
    });
  });
});
