import { LightningElement, wire, api, track } from 'lwc';
import getCases from '@salesforce/apex/ED_CaseController.getCases';
import Id from '@salesforce/user/Id';
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from "lightning/messageService";
import CASE_CHANNEL from "@salesforce/messageChannel/caseManagementMessageChannel__c";


const columns= [
    {label: 'Case Number', fieldName: 'CaseNumber', type: 'text' },
    {label: 'Open Date', fieldName: 'CreatedDate', type: 'date'},
    {label: 'Origin', fieldName: 'Origin', type: 'text'},
    {label: 'Reason', fieldName: 'Reason', type: 'text'},
    {label: 'Status', fieldName: 'Status', type: 'text'},
    {label: 'Action', type: 'button', typeAttributes: { label: 'Edit Case', alternativeText: 'Edit', variant: 'brand' }}
];


export default class ED_CasePage extends NavigationMixin (LightningElement) {
    @wire(MessageContext)   messageContext;
    @track columns = columns;
    @track caseRow={};
    @track caseList = [];
    @track wiredCaseList = [];
    @track error;

    userId = Id;
    
    @wire (getCases, {userId: '$userId'}) 
        userCases(result) {
            this.wiredCaseList = result;
            if (result.data) {
                this.caseList = result.data;
                this.error = undefined;
              } else if (result.error) {
                this.error = result.error;
                this.caseList = [];
              }
        };


    get currentUserId() {
        return this.currentUserId;
    }

    editCase (event) {

        this.caseRow = event.detail.row;
        const recordId = this.caseRow.Id;
       
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId, // pass the record id here.
                actionName: 'edit',
            },
        });
        
    }

    selectRow (event) {
        this.caseRow = event.detail.selectedRows[0];
        const message = {
            accountId: this.caseRow.AccountId,
            contactId: this.caseRow.ContactId
        };

        publish(this.messageContext, CASE_CHANNEL, message);


 
}

    // this method validates the data and creates the csv file to download
    downloadCSVFile() {   
        let rowEnd = '\n';
        let csvString = '';
        // this set elminates the duplicates if have any duplicate keys
        let rowData = new Set();

        // getting keys from data
        this.caseList.forEach(function (record) {
            Object.keys(record).forEach(function (key) {
                rowData.add(key);
            });
        });

        // Array.from() method returns an Array object from any object with a length property or an iterable object.
        rowData = Array.from(rowData);
        
        // splitting using ','
        csvString += rowData.join(',');
        csvString += rowEnd;

        // main for loop to get the data based on key value
        for(let i=0; i < this.caseList.length; i++){
            let colValue = 0;

            // validating keys in data
            for(let key in rowData) {
                if(rowData.hasOwnProperty(key)) {
                    // Key value 
                    // Ex: Id, Name
                    let rowKey = rowData[key];
                    // add , after every value except the first.
                    if(colValue > 0){
                        csvString += ',';
                    }
                    // If the column is undefined, it as blank in the CSV file.
                    let value = this.caseList[i][rowKey] === undefined ? '' : this.caseList[i][rowKey];
                    csvString += '"'+ value +'"';
                    colValue++;
                }
            }
            csvString += rowEnd;
        }

        // Creating anchor element to download
        let downloadElement = document.createElement('a');

        // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        downloadElement.target = '_self';
        // CSV File Name
        downloadElement.download = 'MyCases.csv';
        // below statement is required if you are using firefox browser
        document.body.appendChild(downloadElement);
        // click() Javascript function to download CSV file
        downloadElement.click(); 
        window.alert("File downloaded");
    }

    handleSuccess() {

        const evt = new ShowToastEvent({
            title: this.msgTitle,
            message: this.message,
            variant: this.variant,
        });
        this.dispatchEvent(evt);

        refreshApex(this.wiredCaseList);
 
    }
}