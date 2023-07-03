interface Contact {
  primaryContactId: number;
  emails: string[]; 
  phoneNumbers: string[]; 
  secondaryContactIds: number[]; 
}

interface ContactData {
  contact: Contact;
}
