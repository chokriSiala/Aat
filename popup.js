function onPromptlogin(results) {
    if(results.buttonIndex==1&&results.input1!="")
        navigator.notification.prompt(
                                      'Please enter your password',   // message
                                      function(result2){$(document).trigger('connect', {
                                                                            jid: results.input1.toLowerCase()+"@softtodoserver/Ressource",
                                                                            password: result2.input1
                                                                            });
                                      },                  // callback to invoke
                                      'Connect to Aateepee',            // title
                                      ['Ok','Exit']
                                      );
}


function showPromptLogin() {
    navigator.notification.prompt(
                                  'Please enter your login',   // message
                                  onPromptlogin,                  // callback to invoke
                                  'Connect to Aateepee',            // title
                                  ['Ok','Exit']
                                  );
}

//approval dialog
function onApprove_dialog(results) {
    if(results.buttonIndex==1)
    {Gab.connection.send($pres({
                               to: Gab.pending_subscriber,
                               "type": "unsubscribed"}));
        Gab.pending_subscriber = null;
    }else{
        Gab.connection.send($pres({
                                  to: Gab.pending_subscriber,
                                  "type": "subscribed"}));
        
        Gab.connection.send($pres({
                                  to: Gab.pending_subscriber,
                                  "type": "subscribe"}));
        
        Gab.pending_subscriber = null;
    }
}



function approve_dialog() {
    navigator.notification.alert(
                                    $('#approve-jid').text()+" has requested a subscription to your presence.  Approve or Deny?",   // message
                                  onApprove_dialog,                  // callback to invoke
                               'Subscription Request' ,            // title
                                  ['Deny','Approve']
                                  );
}



//chat dialogue

function onChatDialog(results) {
    if(results.buttonIndex==1&&results.input1!="")
    {  var jid = results.input1.toLowerCase()+"@softtodoserver/Ressource";
        var jid_id = Gab.jid_to_id(jid);
        $('#roster-area').hide();
        $('#chat-area').show();
        //alert(new Date().toISOString());
        if ($('#chat-' + jid_id).length === 0) {
            $('#chat-area').tabs('add', '#chat-' + jid_id, jid);
            $('#chat-' + jid_id).append(
                                        "<div class='chat-messages'></div>" +
                                        "<input type='text' class='chat-input'><button class='sendMesage'>Send</button>");
            $('#chat-' + jid_id).data('jid', jid_id);
        }
        $('#chat-area').tabs('select', '#chat-' + jid_id);    }
}



function chatDialog() {
    navigator.notification.prompt(
                                 "Contact jid",   // message
                                  onChatDialog,                  // callback to invoke
                                  'Add a Contact',
                                  ['Start','Cancel']
                                  );
}

 //Contact dialogue


function onContactDialog(results) {
    if(results.buttonIndex==1&&results.input1!="")
    {  $(document).trigger('contact_added', {
                                     jid: results.input1.toLowerCase()+"@softtodoserver/Ressource"
                           
                                 });
        
    
     }
}



function contactDialog() {
    navigator.notification.prompt(
                                "Contact jid",   // message
                                  onContactDialog,                  // callback to invoke
                                  'Add a Contact',            // title
                                  ['Add','Cancel']
                                  );
}
