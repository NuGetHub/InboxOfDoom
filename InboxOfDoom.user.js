// ==UserScript==
// @name         InboxOfDoom
// @version      0.1
// @description  Ein komplettes Redesign der Inbox auf pr0gramm.com
// @author       5yn74x
// @match        https://pr0gramm.com/*
// @grant        unsafeWindow
// ==/UserScript==
window.msg_array = [];
window.dump = [];
window.uniquenames = [];
window.init = false;

(function() {
    'use strict';
    p.View.Inbox.Threads.prototype.template = "<span></span>";
    window.template =
        `<style>
         ::-webkit-scrollbar {
         width: 5px;
         }
         ::-webkit-scrollbar-track {
         background: #4444;
         }
         ::-webkit-scrollbar-thumb {
         background: var(--theme-secondary-color);
         }
         ::-webkit-scrollbar-thumb:hover {
         background: #555;
         }
         </style>
         <div id="inbox" style="word-wrap:break-word;">
         <div id="users" style="height: 450px;max-height: 450px;max-width: 220px;width:220px;overflow: auto;background: #2a2e31;float:left;"></div>
         <div id="convinfo" style="max-height: 50px;height: 50px;overflow: auto;width: 79.08%;background: #2a2e31;padding: 15px;">
         <div id="info_conv_name" style="text-align: center;">WÄHLE EINE KONVERSATION</div>
         <div id="info_conv_reply"></div>
         </div>
         <div id="conv"  style="max-height: 450px;height: 400px;margin-left: 220px;background: #212121;color:#f2f5f4;overflow: auto; padding: auto;padding-left: 100px;"></div>
         <input type="submit" value="Ältere Nachrichten laden" style="margin-left: 47vh; margin-top: 10px;" onclick="getolder();">
         <div id="reply" style="text-align: center;margin-top: 10px;"></div>
         </div>`;
    p.View.Inbox.prototype.template =
       p.View.Inbox.prototype.template.replace(`<h1 class="pane-head">Nachrichten</h1>`,`<h1 class="pane-head">InboxOfDoom</h1>`)
        .replace(`if(tab=='messages') {?>`,`if(tab=='messages') { create(); ?>`)
        .replace(`<div class="pane">`,`<div class="pane" id="pane">`);
    unsafeWindow.create = function () {
        window.setTimeout(()=>{
        let pane = document.getElementById('pane');
        pane.innerHTML = window.template;
        if(!window.init) {
            getnewestmsgs();
        } else {
            window.msg_array = [];
            window.dump = [];
            window.uniquenames = [];
            getnewestmsgs();
        }
        window.init = true;
        },100);
    };
    unsafeWindow.getolder = function() {
     if(window.lastmsg) {
         getoldermsgs(window.lastmsg);
     }
    };
    unsafeWindow.getmsgsby = function(name) {
      getmsgsby(name);
    };
    unsafeWindow.reply = function() {
        let reply = document.getElementById('reply');
        reply.innerHTML = '<textarea class="comment" id="msgreply"></textarea><div> <input type="submit" onclick="sendmsg(); replyclose(); create();"  value="Abschicken"> <input type="button" value="Abbrechen" onclick="replyclose();" class="cancel" style="display: inline-block;"> </div> </form>';
    };
    unsafeWindow.replyclose = function() {
        let reply = document.getElementById('reply');
        reply.innerHTML = "";
    };
    unsafeWindow.sendmsg = function() {
        let reply = document.getElementById('msgreply').value;
        sendmsg(reply);
    };
})();

function getnewestmsgs() {
   let data = null;
   let xhr = new XMLHttpRequest();
   xhr.withCredentials = true;

   xhr.addEventListener("readystatechange", function () {
       if (this.readyState === 4) {
           let msg = JSON.parse(this.responseText);
           window.lastmsg = msg.messages[msg.messages.length -1].created;
           createV(msg);
       }
   });

   xhr.open("GET", "https://pr0gramm.com/api/inbox/messages");
   xhr.setRequestHeader("cache-control", "no-cache");

   xhr.send(data);
}

function getoldermsgs(last) {
   let data = null;
   let xhr = new XMLHttpRequest();
   xhr.withCredentials = true;

   xhr.addEventListener("readystatechange", function () {
       if (this.readyState === 4) {
           let msg = JSON.parse(this.responseText);
           window.lastmsg = msg.messages[msg.messages.length -1].created;
           createV(msg);
       }
   });

   xhr.open("GET", `https://pr0gramm.com/api/inbox/messages?older=${last}`);
   xhr.setRequestHeader("cache-control", "no-cache");

   xhr.send(data);
   getmsgsby(window.selname);
}


function createV(msg) {
    let users = document.getElementById('users');
    for( let i = 0; i < msg.messages.length; i++ ) {
        let m = msg.messages[i];
        let conversation = (m.sent)? m.recipientName : m.senderName;
        let mark = (m.sent)? m.recipientMark : m.senderMark;
        window.msg_array.push({id: m.id,
                   sent: m.sent,
                   senderName: m.senderName,
                   senderMark: m.senderMark,
                   senderId: m.senderId,
                   recipientName: m.recipientName,
                   recipientMark: m.recipientMark,
                   recipientId: m.recipientId,
                   created: m.created,
                   message: m.message,
                   conv: conversation,
                   convMark: mark});
    }
    $.each(window.msg_array, function (index, entry) {
            if (!window.dump[entry.conv]) {
                window.dump[entry.conv] = true;
                window.uniquenames.push(entry);
            }
    });
    users.innerHTML = '';
    for( let i = 0; i < window.uniquenames.length; i++ ) {
        let n = window.uniquenames[i];
        users.innerHTML += `<ul><a onclick="getmsgsby('${n.conv}')" class="user um${n.convMark}">${n.conv}</a><ul>`;
    }
}

function getmsgsby(name){
    window.selname = name;
    if(!window.selname) return;
    let conv  = document.getElementById('conv');
    let info  = document.getElementById('info_conv_name');
    let reply = document.getElementById('info_conv_reply');
    let mark;
    let id;
    conv.innerHTML = "";
    let msg = [];
    for( let i = 0; i < window.msg_array.length; i++ ) {
        let m = window.msg_array[i];
        let date = new Date(m.created*1000).toLocaleString();
        if(m.conv === name) {
            m.message = m.message.replace(/(?:\r\n|\r|\n)/g, '<br>');
            replacePattern1 = /(\b(https?|http):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])(?=")/igm;
            m.message = m.message.replace(replacePattern1, '<a href="$1">$1</a>');
            if(m.sent) {
              mark = m.recipientMark;
              id = m.recipientId;
              conv.innerHTML +=
                  `<ul style="color:#888888;text-align: right; margin-right: 20px; max-width: 532px;">
                   ${m.message}
                   <br><i style="font-size:12px; color: #444444;"><a href="/user/${m.senderName}" class="user um${m.senderMark}">${m.senderName}</a> ${date}</i>
                   <ul>`;
            } else {
              mark = m.senderMark;
              id = m.senderId;
              conv.innerHTML +=
                  `<ul style="text-align: left; max-width: 532px;">
                   ${m.message}
                   <br><i style="font-size:12px; color: #444444;"><a href="/user/${m.senderName}" class="user um${m.senderMark}">${m.senderName}</a> ${date}</i>
                   <ul>`;
            }
        }
    }
    info.innerHTML  = `<a href="/user/${name}" class="user um${mark}">${name}</a>`;
    reply.innerHTML = `<a onclick="reply();"><span style="float: right;margin-top: -17px;color:var(--theme-secondary-color);" class="pict">r</span></a>`;
    window.recipientId = id;
}
function sendmsg(message) {
    if(!window.selname) return;
    if(!window.recipientId) return;
    let recipientId = window.recipientId;
    let _nonce  = p.user.cookie.id.substr(0, 16);
    var data = `comment=${message}&recipientId=${window.recipientId}&_nonce=${_nonce}`;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open("POST", "https://pr0gramm.com/api/inbox/post");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
}
