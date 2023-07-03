export interface IUserService {
  /**
   * This method calls user dao to get the contact details
   * @param identity could be email , password or both combained or both nulls
   */
  getUserContactDetails(
    identity: IdentityData,
  ): Promise<ContactData>;

}
