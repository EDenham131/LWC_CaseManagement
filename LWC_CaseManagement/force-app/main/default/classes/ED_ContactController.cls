public with sharing class ED_ContactController {
    
    @AuraEnabled (cacheable=true)
    public static List<Contact> getContacts(String userId) {

        List<Contact> myContacts = [SELECT Id, Name, Phone, MobilePhone, (SELECT ContactId FROM Cases   WHERE Case.OwnerId = :userId) FROM Contact ORDER BY Name];
        
        system.debug(userId);
        system.debug(myContacts);
        
        return myContacts;
    }
}