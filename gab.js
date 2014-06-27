var storage;
var Gab = {
    connection: null,

    jid_to_id: function (jid) {
        return Strophe.getBareJidFromJid(jid)
            .replace(/@/g, "-")
            .replace(/\./g, "-");
    },



 on_roster: function (iq) {
    $('#roster-area').show();
       $(iq).find('item').each(function () {
            var jid = $(this).attr('jid');
            var name = $(this).attr('name') || jid;

            // transform jid into an id
            var jid_id = Gab.jid_to_id(jid);

                               var contact = $("<li id='" + jid_id + "'>" +
                                               "<div class='roster-contact offline'>" +
                                               "<div class='roster-name'>" +
                                               name +
                                               "</div><div class='roster-jid' >" +
                                               jid +
                                               "</div></div></li>");
            Gab.insert_contact(contact);
        });

        // set up presence handler and send initial presence
        Gab.connection.addHandler(Gab.on_presence, null, "presence");
        Gab.connection.send($pres());
    },

    pending_subscriber: null,
on_presence_list: function (presence) {
    var ptype = $(presence).attr('type');
    var from = $(presence).attr('from');
    var jid_id = Gab.jid_to_id(from);


  },
    on_presence: function (presence) {
     var ptype = $(presence).attr('type');
        var from = $(presence).attr('from');
        var jid_id = Gab.jid_to_id(from);

        if (ptype === 'subscribe') {
            // populate pending_subscriber, the approve-jid span, and
            // open the dialog
            Gab.pending_subscriber = from;
            $('#approve-jid').text(Strophe.getBareJidFromJid(from));
            approve_dialog();
        } else if (ptype !== 'error') {
            var contact = $('#roster-area li#' + jid_id + ' .roster-contact')
                .removeClass("online")
                .removeClass("away")
                .removeClass("offline");
            if (ptype === 'unavailable') {
                contact.addClass("offline");
            } else {
                var show = $(presence).find("show").text();

                if (show === "" || show === "chat") {
                    contact.addClass("online");
                } else {
                    contact.addClass("away");
                }
            }

            var li = contact.parent();
            li.remove();
            Gab.insert_contact(li);
        }

        // reset addressing for user since their presence changed
        var jid_id = Gab.jid_to_id(from);
        $('#chat-' + jid_id).data('jid', Strophe.getBareJidFromJid(from));

        return true;
    },

    on_roster_changed: function (iq) {
        $(iq).find('item').each(function () {
            var sub = $(this).attr('subscription');
            var jid = $(this).attr('jid');
            var name = $(this).attr('name') || jid;
            var jid_id = Gab.jid_to_id(jid);

            if (sub === 'remove') {
                // contact is being removed
                $('#' + jid_id).remove();
            } else {
                // contact is being added or modified
                var contact_html = "<li id='" + jid_id + "'>" +
                    "<div class='" +
                    ($('#' + jid_id).attr('class') || "roster-contact offline") +
                    "'>" +
                    "<div class='roster-name'>" +
                    name +
                    "</div><div class='roster-jid'>" +
                    jid +
                    "</div></div></li>";

                if ($('#' + jid_id).length > 0) {
                    $('#' + jid_id).replaceWith(contact_html);
                } else {
                    Gab.insert_contact($(contact_html));
                }
            }
        });

        return true;
    },



  on_message: function (message) {
      $('#roster-area').hide();
      $('#chat-area').show();
 
      var full_jid = $(message).attr('from');
        var jid = Strophe.getBareJidFromJid(full_jid);
        var jid_id = Gab.jid_to_id(jid);

//alert(new Date().toISOString());
        if ($('#chat-' + jid_id).length === 0) {
            $('#chat-area').tabs('add', '#chat-' + jid_id, jid);
            $('#chat-' + jid_id).append(
                "<div class='chat-messages'></div>" +
                "<textarea   class='chat-input' /><button class='sendMesage'>Send</button>");
       $('#chat-' + jid_id).data('jid', jid_id);
        }
    $('#chat-area').tabs('select', '#chat-' + jid_id);
       // $('#chat-' + jid_id + ' input').focus();

        var composing = $(message).find('composing');

        if (composing.length > 0) {
            $('#chat-' + jid_id + ' .chat-messages').append(
                "<div class='chat-event'>" +
                Strophe.getNodeFromJid(jid) +
                " is typing...</div>");

            Gab.scroll_chat(jid_id);
        }

        var body = $(message).find("html > body");
var html;

        if (body.length === 0) {
            body = $(message).find('body');

            if (body.length > 0) {
        body = body.clone().children().remove().end().text();
           html = '<article class="message-wrap">';

	html += '<div class="message">';
	html += '<header><h4>' + jid_id + '</h4></header>';
	html += '<section>' + body + '</section>';
	html += '<footer class="time">' +  $(message).find('delay').text() + '</footer>';
	html += '</div></article>';

      } else {
                body = null;
            }
        } else {
            body = body.contents();

            var span = $("<span></span>");
            body.each(function () {
                if (document.importNode) {
                    $(document.importNode(this, true)).appendTo(span);
                } else {
                    // IE workaround
                    span.append(this.xml);
                }
            });

            body = span;
        }
     
       if (body) {
            // remove notifications since user is now active
            $('#chat-' + jid_id + ' .chat-event').remove();

            // add the new message
            $('#chat-' + jid_id + ' .chat-messages').append(
            html);

            //$('#chat-' + jid_id + ' .chat-message:last .chat-text')
              //  .append(html);

            Gab.scroll_chat(jid_id);
        }

        return true;
    },

    scroll_chat: function (jid_id) {
        var div = $('#chat-' + jid_id + ' .chat-messages').get(0);
        div.scrollTop = div.scrollHeight;
    },


    presence_value: function (elem) {
        if (elem.hasClass('online')) {
            return 2;
        } else if (elem.hasClass('away')) {
            return 1;
        }

        return 0;
    },

  _sendMessage:function(body)
  {
    var jid = $(this).parent().data('jid');
  //ev.preventDefault();

       var message = $msg({to: jid,
        "type": "chat"}).c('body').t(body).c('delay').t(new Date().toISOString()).up().c('active', {xmlns: "http://jabber.org/protocol/chatstates"});
      Gab.connection.send(message);

      $(this).parent().find('.chat-messages').append(
          "<div class='chat-message'>&lt;" +
          "<span class='chat-name me'>" +
          Strophe.getNodeFromJid(Gab.connection.jid) +
          "</span>&gt;<span class='chat-text'>" +
          body +
          "</span></div>");
      Gab.scroll_chat(Gab.jid_to_id(jid));

      $('.chat-input').val('');
      $('.chat-input').parent().data('composing', false);
    },

        insert_contact: function (elem) {
        var jid = elem.find('.roster-jid').text();
        var pres = Gab.presence_value(elem.find('.roster-contact'));

        var contacts = $('#roster-area li');

        if (contacts.length > 0) {
            var inserted = false;
            contacts.each(function () {
                var cmp_pres = Gab.presence_value(
                    $(this).find('.roster-contact'));
                var cmp_jid = $(this).find('.roster-jid').text();

                if (pres > cmp_pres) {
                    $(this).before(elem);
                    inserted = true;
                    return false;
                } else if (pres === cmp_pres) {
                    if (jid < cmp_jid) {
                        $(this).before(elem);
                        inserted = true;
                        return false;
                    }
                }
            });

            if (!inserted) {
                $('#roster-area ul').append(elem);
            }
        } else {
            $('#roster-area ul').append(elem);
        }
    }
};
document.addEventListener("deviceready", deviceready, false);

function deviceready() {
      $('#signUpConnect').bind('click',function (ev) {
                          //  ev.preventDefault();
      alert(requestFromServer("http://192.168.1.79:9090/plugins/userService/userservice?type=add&secret=UHS103&username="+$('#jid').val().toLowerCase()+"@softtodoserver/Ressource&password="+$('#password').val()+"&name=franz&email=franz@kafka.com"));

                            });
                            
   $('#loginConnect').bind('click',function (ev) {
               ev.preventDefault();
                  $(document).trigger('connect', {
                                                jid:$('#jid').val().toLowerCase()+"@softtodoserver/Ressource",
                                                password: $('#password').val()
                                                });
                           
                            });
    
    $('#contact-btn').bind('click',function (ev) {
   $('#chat-area').hide();
   $('#roster-area').show();
  });
    $('#chat-btn').bind('click',function (ev) {
                           var options = new ContactFindOptions();
                           options.filter="Bob";
                           var fields = ["id","displayName", "name","phoneNumbers"];
                           navigator.contacts.find(fields, onSuccess, onError, options);
                         
                           
                           // onSuccess: Get a snapshot of the current contacts
                           //
                           function onSuccess(contacts) {
                           alert(contacts.length);
                           for (var i=0; i<contacts.length; i++) {
                           console.log("Display Name = " + contacts[i].displayName);
                           }
                           }
                           
                           // onError: Failed to get the contacts
                           //
                           function onError(contactError) {
                           alert('onError!');
                           }
   
                           
                           
Gab.connection.addHandler(Gab.on_presence_list, null, "presence");
      var pres = $pres();
            Gab.connection.send($pres());

                           contactDialog();
    });

    

   $('#chat-area').tabs().find('.ui-tabs-nav').sortable({axis: 'x'});

    $('.roster-contact').live('click', function () {
      $('#roster-area').hide();
      $('#chat-area').show();
        var jid = $(this).find(".roster-jid").text();
        var name = $(this).find(".roster-name").text();
        var jid_id = Gab.jid_to_id(jid);
                           
 
        if ($('#chat-' + jid_id).length === 0) {
            $('#chat-area').tabs('add', '#chat-' + jid_id, name);
            $('#chat-' + jid_id).append(
                "<div class='chat-messages'></div>" +
                "<input type='text' class='chat-input'><button class='sendMesage'>Send</button>");
            $('#chat-' + jid_id).data('jid', jid);
        }
        $('#chat-area').tabs('select', '#chat-' + jid_id);
  
        //$('#chat-' + jid_id + ' input').focus();
       
    });

     $('.chat-input').live('keypress', function (ev) {
        var jid = $(this).parent().data('jid');


          //  ev.preventDefault();


            var composing = $(this).parent().data('composing');
            if (!composing) {
                var notify = $msg({to: jid, "type": "chat"})
                    .c('composing', {xmlns: "http://jabber.org/protocol/chatstates"});

                Gab.connection.send(notify);

                $(this).parent().data('composing', true);
            }

    });

$('.sendMesage').live('click', function (ev) {
        var jid = $(this).parent().data('jid');
        ev.preventDefault();

            var body = $('.chat-input').val();
                      var today=new Date();
                     today=today.format("yyyy-mm-dd hh:mm");;

          var message = $msg({to: jid,
           "type": "chat"}).c('body').t(body).c('delay',today).up().c('active', {xmlns: "http://jabber.org/protocol/chatstates"});
         Gab.connection.send(message);
          //  Gab.connection.send(message);

            $(this).parent().find('.chat-messages').append(
                "<div class='chat-message'>&lt;" +
                "<span class='chat-name me'>" +
                Strophe.getNodeFromJid(Gab.connection.jid) +
                "</span>&gt;<span class='chat-text'>" +
                body +
                "</span></div>");
            Gab.scroll_chat(Gab.jid_to_id(jid));

            $('.chat-input').val('');
            $('.chat-input').parent().data('composing', false);

    });

    $('#config-btn').live('click',function () {
   if(Gab.connection) Gab.connection.disconnect();
        Gab.connection = null;
  showhide();
                           //   $('#toolbar').children().off();
    });

   

    $('#calendar-btn').bind('click',function () {
    chatDialog("login_dialog");
    });
 
    if (localStorage['auth']) {
		storage = JSON.parse($.base64.decode(localStorage['auth']));
		$(document).trigger('connect', {
                            jid: storage.login,
                            password:storage.password
                            });
       
	} else  showhide("login_dialog");
    /*$(document).trigger('connect', {
                        jid: "test2@softtodoserver/Ressource",
                        password:"iosdevelopper"
                        });*/
};

$(document).bind('connect', function (ev, data) {
    var connection = new Strophe.Connection(
        'http://192.168.1.79:7070/http-bind/');
    connection.connect(data.jid, data.password, function (status) {
        if (status == Strophe.Status.CONNECTING) {

    } else if (status == Strophe.Status.CONNFAIL || status == Strophe.Status.AUTHFAIL) {
 showhide("login_dialog");
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {

    } else if (status == Strophe.Status.DISCONNECTED) {
  $(document).trigger('disconnected');
    } else if (status == Strophe.Status.CONNECTED) {
  Gab.connection = connection;
 // Gab.connection.register.init(Gab.connection);
    storage = {type: 0, login: data.jid, password: data.password};
     localStorage['auth'] = $.base64.encode(JSON.stringify(storage));
     $(document).trigger('connected');
                       }}
     );

    
});

$(document).bind('connected', function () {
                 $('#login_dialog').hide();
                 $('#header').show();
                $('#toolbar').show();
                 var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
Gab.connection.sendIQ(iq, Gab.on_roster);
Gab.connection.addHandler(Gab.on_roster_changed, 'jabber:iq:roster', 'iq', 'set');
Gab.connection.addHandler(Gab.on_message,null, 'message', 'chat');

//connection.send($pres().tree());
});

$(document).bind('disconnected', function () {
    Gab.connection = null;
    Gab.pending_subscriber = null;

    $('#roster-area ul').empty();
    $('#chat-area ul').empty();
    $('#chat-area div').remove();
    localStorage.removeItem('auth');
    showhide("login_dialog");
   
});

$(document).bind('contact_added', function (ev, data) {
    var iq = $iq({type: "set"}).c("query", {xmlns: "jabber:iq:roster"})
        .c("item", data);
    Gab.connection.sendIQ(iq);

    var subscribe = $pres({to: data.jid, "type": "subscribe"});
    Gab.connection.send(subscribe);
});
