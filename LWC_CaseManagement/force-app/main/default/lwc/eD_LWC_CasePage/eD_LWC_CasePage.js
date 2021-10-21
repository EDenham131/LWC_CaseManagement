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

    userId = Id;


    @wire (getCases, {userId: '$userId'}) 
        userCases;
        /*
        ({error, data}) {
            console.log(data);
            console.log(error);
            if (data) {
                this.cases = data;
                this.errors = null;
            } else if (error) {
                this.errors = error;
                this.cases = undefined;
            }
        };*/

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
        refreshApex(this.userCases);
    }

    selectRow (event) {
        this.caseRow = event.detail.selectedRows[0];
        const message = {
            accountId: this.caseRow.AccountId,
            contactId: this.caseRow.ContactId
        };

        publish(this.messageContext, CASE_CHANNEL, message);


 
    }

    handleClick(event){
        // get the case list 
        var myCases = userCases.data;

        // call the helper function which "return" the CSV data as a String
        var csv = helper.convertArrayOfObjectsToCSV(myCases);
        if (csv == null){return;}

        // ####--code for create a temp. <a> html tag [link tag] for download the CSV file--####
        var downloadElement = document.createElement('a');
        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        downloadElement.target = '_self'; 
        // CSV File Name
        downloadElement.download = 'MyCases.csv';  
        document.body.appendChild(downloadElement); // Required for FireFox browser
        downloadElement.click(); // using click() js function to download csv file
    }

    convertArrayOfObjectsToCSV (objectRecords){
        var csvStringResult, counter, keys, columnDivider, lineDivider;

        // check if "objectRecords" parameter is null, then return from function
        if (objectRecords == null || !objectRecords.length) {
            return null;
        }

        // store ,[comma] in columnDivider variable for separate CSV values and
        // for start next line use '\n' [new line] in lineDivider variable
        columnDivider = ',';
        lineDivider =  '\n';

        // in the keys valirable store fields API Names as a key
        // this labels use in CSV file header
        keys = Object.keys(objectRecords[0]); // FIXME: If the first record has empty fields, then they won't appear in header.
        console.log(keys);

        csvStringResult = '';
        csvStringResult += keys.join(columnDivider);
        csvStringResult += lineDivider;

        for(var i=0; i < objectRecords.length; i++){
            counter = 0;

            for(var sTempkey in keys) {
                var skey = keys[sTempkey] ;

                // add , [comma] after every String value,. [except first]
                if(counter > 0){
                    csvStringResult += columnDivider;
                }

                csvStringResult += '"'+ objectRecords[i][skey]+'"';

                counter++;

            }

            csvStringResult += lineDivider;
        }

        return csvStringResult;
    }

    handleSuccess() {

        const evt = new ShowToastEvent({
            title: this.msgTitle,
            message: this.message,
            variant: this.variant,
        });
        this.dispatchEvent(evt);
     
    }
}