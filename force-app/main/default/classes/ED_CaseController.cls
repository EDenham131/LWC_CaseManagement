public with sharing class ED_CaseController {
    
    @AuraEnabled (cacheable=true)
    public static List<Case> getCases(String userId) {
        system.debug(userId);
        List<Case> myCases = [Select Id, AccountId, Account.Name, CaseNumber, Origin, Reason, ContactId, Contact.Name, CreatedDate, Status FROM Case
                Where OwnerId = :userId ORDER BY Status ];

        system.debug(myCases);
        return myCases;
            }
}