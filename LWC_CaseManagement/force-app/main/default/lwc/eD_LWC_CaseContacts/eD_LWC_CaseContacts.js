import { LightningElement, wire, track } from 'lwc';
import getContacts from '@salesforce/apex/ED_ContactController.getContacts';
import {
    subscribe,
    MessageContext
  } from "lightning/messageService";
import CASE_CHANNEL from "@salesforce/messageChannel/caseManagementMessageChannel__c";
import Id from '@salesforce/user/Id';


const columns= [

    {label: 'Contact Name', 
    fieldName: 'URL',
    type: 'url', 
    typeAttributes: { 
        label: {
            fieldName: 'Name'
        },
        target: '_self'
    }
   },
   {label: 'Phone', fieldName: 'Phone', type: 'text'},
   {label: 'Mobile', fieldName: 'MobilePhone', type: 'text'}
   

];

export default class ED_LWC_CaseContacts extends LightningElement {
    @wire(MessageContext)   messageContext;
    @track lstContacts;
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
        getContacts({ userId: this.userId }).then(response => {
            let tempConList = []; 
            
            response.forEach((record) => {
                let tempConRec = Object.assign({}, record);  
                tempConRec.URL = '/' + tempConRec.Id;
                tempConList.push(tempConRec);
                
            });
            
            this.lstContacts = tempConList;

            console.log(this.lstContacts);

        }).catch(error => {
            console.log('Error: ' +error);
        });
    }


    caseSelectedHandler(message) {
        this.receivedMessage = message;
        const contactId = message.contactId;
        
        this.selectedRow = [contactId];
        var selectedRowNum;

        for(let i = 0; i < this.lstContacts.length; i++) {
            var row = this.lstContacts[i];
  
            if (row.Id === contactId) {
                selectedRowNum = i;
            }
        }

        var cloneData = this.lstContacts.slice(0, selectedRowNum);
        var moveToTop = this.lstContacts.slice(selectedRowNum);
        this.lstContacts = moveToTop.concat(cloneData);
        

  
   
    }

    
}