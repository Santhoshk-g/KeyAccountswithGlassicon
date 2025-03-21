import { LightningElement, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Accounts from '@salesforce/schema/Account';
import keyaccount from '@salesforce/apex/KeyAccountqueryWithGlassIcon.KeyAccountlist';
import Unbilled from '@salesforce/apex/KeyAccountqueryWithGlassIcon.returnAccounts';
import Opportunity from '@salesforce/schema/Opportunity';
//import Opportunitysalesarea from '@salesforce/schema/Opportunity.Sales_Area__c';
//import PROFILE_NAME_FIELD from '@salesforce/schema/User.Profile.Name';
import strUserId from '@salesforce/user/Id';
import {getRecord} from 'lightning/uiRecordApi';



export default class Keyaccountswithglassicon extends LightningElement {

   @track prfName;
   kam = false;
  // Nonkam = false;

     

    get business(){
        return [

            {label: 'Infinity',value: 'Infinity'},
            {label: 'Inspire',value: 'Inspire'},
        
        ];
    }
@track data =[];
@track columns;
@track error;
@track recordtype;
@track sales;
loaded = false;
@track grouped;
@track fromdate;
@track todate;
Gdata = false;
@track isfilter =false;
@track PicklistValues;
@track accids = [];
@track unbilledacc = [];
Nonkam = true;
@track undata;
@wire (getObjectInfo,{objectApiName : Accounts})
accountInfo;
@wire (getObjectInfo,{objectApiName : Opportunity})
opportunityInfo;


    
handlebusinessChange(event){
  this.recordtype = event.target.value;
  
}
handlesalesareaChange(event){
    this.sales = event.target.value;
}
fromDateChange(event){
    this.fromdate = event.target.value;
}
toDateChange(event){
    this.todate = event.target.value;
}



submit(){
    if(this.recordtype == null){
        this.error = 'Please Select Required Field';
    }else if(this.fromdate == null & this.todate != null){
        this.error = 'Please fill the both dates';
        this.Gdata = false;
    }else if(this.fromdate != null & this.todate == null){
        this.error = 'Please fill the both dates';
        this.Gdata = false;
    }else if(this.fromdate > this.todate & this.fromdate != null & this.todate != null){
        this.error = 'Todate should be greater than Fromdate';

    }else{
   
    this.loaded = true;

    keyaccount({recordtype:this.recordtype,sales:this.sales,fdate:this.fromdate,tdate:this.todate})
    .then(result=>{
        console.log('data======>'+result);
        //this.data = result;
        
        const filteredList = result.filter((item, index) => {
            return index === result.findIndex(obj => {
                return JSON.stringify(obj) === JSON.stringify(item);
            });
          });
          this.data = filteredList;
          console.log('Data'+JSON.stringify(this.data));
          this.data.forEach(accid =>{
            this.accids.push(accid.AccountId);
          })
          console.log('ACCIDS'+JSON.stringify(this.accids) );
          console.log('###########'+JSON.stringify(filteredList) );
    
            if(this.data == null || this.data == ''){
                this.error = 'No Records Found';
                this.Gdata = false;
            }else{
            this.Gdata = true;
            this.error = undefined;
            }
    Unbilled({AccountIds:this.accids})
    .then(result=>{
        this.unbilledacc = result;
        console.log('unbilledacc==>'+JSON.stringify(this.unbilledacc));
        this.undata = this.unbilledacc.length;
        this.loaded = false;
    })
    .catch(error=>{
        this.loaded = false;
        this.error = error;
    })
            
//console.log('ssssssss'+filtered);
        })
        
    .catch(error=>{
        this.loaded = false;
        this.error = error; //.body.message;
    
    })
}
}
get groupedData() {
    const grouped = this.data.reduce((acc, obj) => {
        const key = obj.AccountName;
        if (!acc[key]) {
            acc[key] = {
                AccountName: key,   
                oppdata: []
             
            };
        }
        acc[key].oppdata.push(obj);
        return acc;
    }, {});
    
    console.log('Groupdata@@@@@@'+JSON.stringify(grouped));
    return Object.values(grouped);
   
}
get keyCount() {
    return Object.keys(this.groupedData).length;
}

showtemplate(){

    this.isfilter = true;
   
    
}
hideModalBox(){
    this.isfilter = false;
}

exportData(){
    // Prepare a html table
    console.log('ppapapap==='+this.recordtype)

    let doc = '<table>';
    // Add styles for the table
    doc += '<style>';
    doc += 'table, th, td {';
    doc += '    border: 1px solid black;';
    doc += '    border-collapse: collapse;';
    doc += '}';          
    doc += '</style>';
    // Add all the Table Headers
    doc += '<tr>';
               
        doc += '<th>'+ 'Account Name' +'</th>';
        doc += '<th>'+ 'opportunity Name' +'</th>';
        doc += '<th>'+ 'opportunity Region' +'</th>'; 
        doc += '<th>'+ 'Sales Area' +'</th>';          
        doc += '<th>'+ 'TotalEstimated Quantity' +'</th>';
        doc += '<th>'+ 'Appropriated Quantity' +'</th>';
       
    doc += '</tr>';
    // Add the data rows
    this.data.forEach(record => {
        
        doc += '<tr>';
        doc += '<th>'+record.AccountName+'</th>'; 
        doc += '<th>'+record.opportunityName+'</th>'; 
        doc += '<th>'+record.opportunityRegion+'</th>';
        doc += '<th>'+record.SalesArea+'</th>';
        doc += '<th>'+record.TotalEstimatedQuantity+'</th>';
        doc += '<th>'+record.AppropriatedQuantity+'</th>';
        
        doc += '</tr>';
    });
    doc += '</table>';

    var element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
    let downloadElement = document.createElement('a');
    downloadElement.href = element;
    downloadElement.target = '_self';
    // use .csv as extension on below line if you want to export data as csv
    downloadElement.download = 'GlassIcon Key Accounts Sales.xls';
    document.body.appendChild(downloadElement);
    downloadElement.click(); 
   }

download(){
    console.log('ppapapap==='+this.recordtype)

    let doc = '<table>';
    // Add styles for the table
    doc += '<style>';
    doc += 'table, th, td {';
    doc += '    border: 1px solid black;';
    doc += '    border-collapse: collapse;';
    doc += '}';          
    doc += '</style>';
    // Add all the Table Headers
    doc += '<tr>';
               
        doc += '<th>'+ 'Account Name' +'</th>';
        doc += '<th>'+ 'City' +'</th>';
        doc += '<th>'+ 'Type' +'</th>';
        doc += '<th>'+ 'Sales Area' +'</th>';           
        doc += '<th>'+ 'TotalEstimated Quantity' +'</th>';
        doc += '<th>'+ 'Appropriated Quantity' +'</th>';
       
    doc += '</tr>';
    // Add the data rows
    this.unbilledacc.forEach(record => {
        
        doc += '<tr>';
        doc += '<th>'+record.Name+'</th>'; 
        doc += '<th>'+record.City_Name__c+'</th>'; 
        doc += '<th>'+record.Type+'</th>';
        doc += '<th>'+record.Sales_Area__c+'</th>';
        doc += '<th>'+'0'+'</th>';
        doc += '<th>'+'0'+'</th>';
        
        doc += '</tr>';
    });
    doc += '</table>';

    var element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
    let downloadElement = document.createElement('a');
    downloadElement.href = element;
    downloadElement.target = '_self';
    // use .csv as extension on below line if you want to export data as csv
    downloadElement.download = 'Unbilled Account.xls';
    document.body.appendChild(downloadElement);
    downloadElement.click(); 
   }
}
