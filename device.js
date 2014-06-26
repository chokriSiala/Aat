var MyDevice={
 loadPhoneContacts: function ()  {
   
    var options = new ContactFindOptions();
    options.filter="";
    options.multiple = true;
    var fields = ["displayName", "name", "nickname", "phoneNumbers"];
    navigator.contacts.find(fields, onSuccessOfLoadContacts, onErrorOfLoadContacts, options);
},

onSuccessOfLoadContacts:function(contacts) {
    var contactnumber;
    alert("Got '" + contacts.length + "' contacts.");
    
    for (var i=0; i<contacts.length; i++) {
        
        var contactname =  contacts[i].name.formatted;
        alert(ContactName + " has " + contacts[i].phoneNumbers.length + " numbers");
        alert(contacts[i].phoneNumbers[1].value);
        
        for (var j=0; j<contacts[i].phoneNumbers.length; j++) {
            contactnumber = contacts[i].phoneNumbers[j].value;
            alert("Got number:" + contactnumber);
        }
        
        
        
    }
},

onErrorOfLoadContacts:function(contactError) {
    alert('onError!');
}

};