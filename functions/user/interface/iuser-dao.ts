
export interface IUserDao {
  /**
   * This method fetches contact details of the user from the db
   * @param identity could be email , password or both combained or both nulls
   */
  getContact(
    identity: IdentityData,
  ): Promise<DbModel[]>;

  createContact(
    linkPrecedence: string, identity?:IdentityData,linkedId?: number
  ): Promise<DbModel>;

  updateContact(
    id:number,linkedID:number
  ): Promise<void>;

}
