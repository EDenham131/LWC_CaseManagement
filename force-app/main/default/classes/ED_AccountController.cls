public with sharing class ED_AccountController {
    @AuraEnabled (cacheable=true)
    public static List<Account> getAccounts(String userId) {
        List<Account> myAccts = [SELECT Id, Name, Phone, Industry, (SELECT AccountId FROM Cases   WHERE Case.OwnerId = :userId) FROM Account ORDER BY Name];

        system.debug(userId);
        system.debug(myAccts);
        
        return myAccts;
    }
}