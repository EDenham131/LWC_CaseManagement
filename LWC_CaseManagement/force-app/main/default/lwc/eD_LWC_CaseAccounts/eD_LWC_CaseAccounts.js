import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/ED_AccountController.getAccounts';
import {
    subscribe,
    MessageContext
  } from "lightning/messageService";
import CASE_CHANNEL from "@salesforce/messageChannel/caseManagementMessageChannel__c";
import Id from '@salesforce/user/Id';


const columns= [

    {label: 'Account', 
     fieldName: 'URL',
     type: 'url', 
     typeAttributes: { 
         label: {
             fieldName: 'Name'
         },
         target: '_self'
     }
    },
    { label: 'Industry', fieldName: 'Industry', type: 'text' },

    { label: 'Phone', fieldName: 'Phone', type: 'text' }
];

export default class ED_LWC_CaseAccounts extends LightningElement {
    @wire(MessageContext)   messageContext;
    @track lstAccounts;
    @track columns = columns;
    @track selectedRow;

    receivedMessage;
    subscription = null;
    
    userId = Id;


    connectedCallback(){
        // subscribe to the caseselected event
        if(this.subscription == null) {
            this.subscription = subscribe(
                this.messageContext,
                CASE_CHANNEL,
                (message) => {
                    this.caseSelectedHandler(message);
                }
            )
        }
        // Create the URL for the account link
        getAccounts({ userId: this.userId }).then(response => {
            let tempAcctList = []; 
            
            response.forEach((record) => {
                let tempAcctRec = Object.assign({}, record);  
                tempAcctRec.URL = '/' + tempAcctRec.Id;
                tempAcctList.push(tempAcctRec);
                
            });
            
            this.lstAccounts = tempAcctList;

            console.log(this.lstAccounts);

        }).catch(error => {
            console.log('Error: ' +error);
        });
    }


    caseSelectedHandler(message) {
        this.receivedMessage = message;
        const accountId = message.accountId;
        
        this.selectedRow = [accountId];
        var selectedRowNum;

        for(let i = 0; i < this.lstAccounts.length; i++) {
            var row = this.lstAccounts[i];
  
            if (row.Id === accountId) {
                selectedRowNum = i;
            }
        }

        var cloneData = this.lstAccounts.slice(0, selectedRowNum);
        var moveToTop = this.lstAccounts.slice(selectedRowNum);
        this.lstAccounts = moveToTop.concat(cloneData);
        

  
   
    }

    
}