// ==UserScript==
// @name         InboxOfDoom
// @version      0.2
// @description  Ein komplettes Redesign der Inbox auf pr0gramm.com
// @author       5yn74x
// @match        https://pr0gramm.com/*
// @grant        unsafeWindow
// ==/UserScript==

window.dumpnames   = [];
window.dumpmsg     = [];
window.uniquenames = [];
window.msg_array   = [];
window.init        = false;

(function() {
    'use strict';
    p.View.Inbox.Threads.prototype.template = "<!-- 5yn74x mag dich! -->";
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
<div id="users" style="height: 450px;max-height: 450px;max-width: 220px;width:220px;overflow: auto;background: #2a2e31;float:left;padding-bottom: 10px;"></div>
<div id="convinfo" style="max-height: 50px;height: 50px;overflow: auto;width: 79.08%;background: #2a2e31;padding: 15px;text-align: center;">
<span id="info_conv_name">WÄHLE EINE KONVERSATION</span>
<span id="info_conv_reply" style="float: right;"></span>
</div>
<div id="conv"  style="max-height: 450px;height: 400px;margin-left: 220px;background: #212121;color:#f2f5f4;overflow: auto;padding-left: 100px;"></div>
<input type="submit" value="Ältere Nachrichten laden" style="margin-left: 47vh; margin-top: 10px;" onclick="getolder();">
<div id="reply" style="text-align: center;margin-top: 10px;"></div>
</div>`;
    p.View.Inbox.prototype.template =
        p.View.Inbox.prototype.template.replace(`<h1 class="pane-head">Nachrichten</h1>`,`<h1 class="pane-head">InboxOfDoom</h1>`)
        .replace(`if(tab=='messages') {?>`,`if(tab=='messages') { create(); ?>`)
        .replace(`<div class="pane">`,`<div class="pane" id="pane">`);

    unsafeWindow.create = function (name) {
        window.setTimeout(()=>{
            let pane = document.getElementById('pane');
            pane.innerHTML = window.template;
            if(!window.init) {
                getmsg(false);
            } else {
                window.msg_array = [];
                window.dumpnames = [];
                window.uniquenames = [];
                window.msg_array   = [];
                window.dumpmsg     = [];
                window.selname = null;
                getmsg(false);
                if(name) getmsgsby(name);
            }
            window.init = true;
        },100);
    };

    unsafeWindow.getolder = function() {
        if(window.lastmsg) {
            getmsg(window.lastmsg);
        }
    };

    unsafeWindow.getmsgsby = function(name) {
        getmsgsby(name);
    };

    unsafeWindow.reply = function() {
        let reply = document.getElementById('reply');
        reply.innerHTML = '<textarea class="comment" id="msgreply"></textarea><div> <input type="submit" onclick="sendmsg();"  value="Abschicken"> <input type="button" value="Abbrechen" onclick="replyclose();" class="cancel" style="display: inline-block;"> </div> </form>';
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

function getmsg(older) {
    let urlparam = (older)? `?older=${older}` : '';
    let data = null;
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            let msg = JSON.parse(this.responseText).messages;
            window.lastmsg = msg[msg.length -1].created;

            for(let i = 0; i < msg.length; i++) {
                let m = msg[i];

                let conv = (m.sent)? m.recipientName : m.senderName;
                let mark = (m.sent)? m.recipientMark : m.senderMark;

                if (!window.dumpnames[conv]) {
                    window.dumpnames[conv] = true;
                    window.uniquenames.push({conv: conv, convMark: mark});
                }
                if (!window.dumpmsg[m.id]) {
                    window.dumpmsg[m.id] = true;
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
                                           conv: conv,
                                           convMark: mark});
                }
            }
            createUserList();
            if (window.selname) getmsgsby(window.selname);
        }
    });

    xhr.open("GET", `https://pr0gramm.com/api/inbox/messages${urlparam}`);
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
}

function createUserList() {
    let users = document.getElementById('users');
    users.innerHTML = '';
    for( let i = 0; i < window.uniquenames.length; i++ ) {
        let n = window.uniquenames[i];
        users.innerHTML += `<div style="margin-top: 10px; margin-left: 30px;"><a onclick="getmsgsby('${n.conv}')" class="user um${n.convMark}">${n.conv}</a></div>`;
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
            let replaceurl = /((?:http|https):\/\/[\w-]+\.[\w-]+[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])/gm;
            let message = m.message.replace(replaceurl, '<a href="$1">$1</a>');
            if(m.sent) {
                mark = m.recipientMark;
                id = m.recipientId;
                conv.innerHTML +=
                    `<ul style="color:#888888;text-align: right; margin-right: 20px; max-width: 532px;">
${message}
<br><i style="font-size:12px; color: #444444;"><a href="/user/${m.senderName}" class="user um${m.senderMark}">${m.senderName}</a> ${date}</i>
<ul>`;
            } else {
                mark = m.senderMark;
                id = m.senderId;
                conv.innerHTML +=
                    `<ul style="text-align: left; max-width: 532px;">
${message}
<br><i style="font-size:12px; color: #444444;"><a href="/user/${m.senderName}" class="user um${m.senderMark}">${m.senderName}</a> ${date}</i>
<ul>`;
            }
        }
    }
    info.innerHTML  = `<a href="/user/${name}" class="user um${mark}">${name}</a>`;
    reply.innerHTML = `<a onclick="reply();"><span class="pict">r</span> Antworten</a>`;
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
            if (JSON.parse(this.responseText).success) {
                let name = window.selname;
                unsafeWindow.create(name);
            }
        }
    });

    xhr.open("POST", "https://pr0gramm.com/api/inbox/post");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
}
