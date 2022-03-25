"use strict";

/*
    Author: Bukman, glayn2bukman@gmail.com
    About : This is a private and simple chatting[bug/issue reporting] application
*/

var REVISION = "0.0.1";

var HOST = "https://twebale.com/pchat-api/";
    //HOST = "http://localhost:60101/";
    //HOST = "http://192.168.43.208:60101/";

var LOGIN_URL = HOST+"login";
var POST_MESSAGE_URL = HOST+"post_message";
var POST_MESSAGE_WITH_ATTACHMENT_URL = HOST+"post_message_with_attachment";
var INBOX_URL = HOST+"inbox";
var UPDATE_ACCOUNT_URL = HOST+"update_account";
var ONLINE_STATE_URL = HOST+"activity_status";
var THEMES_URL = "static/themes";  //HOST+"themes";
var SET_THEME_URL = HOST+"set_user_theme";
var SET_MAX_INBOX_URL = HOST+"set_max_inbox";
var CAPTURED_MEDIA_UPLOAD_URL = HOST+"captured_media_upload";
var LOGIN_EMBEDDED_URL = HOST+"../login_embedded";
var staticCryptURL = 'static/staticCrypt.js';

var FILE_ATTACHMENT_PATH = HOST+"static/files/";
var THEMES_PATH = "static/themes/";
var DEFAULT_THEME = "base.css";

var EMOJI_PATH = "static/emoji/";

var GROUPS=[];
var ACTIVE_GROUP = "";
var UNAME = "";
var CHATS = {}
var USER_THEMES = [];

var CHECK_ONLINE_STATUS_RATE = 10; // seconds
var INBOX_READ_RATE = 20; // in seconds
var INBOX_READ_INTERVAL_VAR;

var LAST_ACTIVE_GROUP = ""; // will help us not reload themes when user logs out and login again

var __EMBEDDED__ = false; // set to true if application is embedded in another app

var CALC_EXIT_CODE = "1.000.1"; // should be resettable from app

var _notification_uname="";

var SUPPORTS_EMOJIS = true;

var MAX_INBOX = 150;
var MAX_INBOX_UPPER_LIMIT = 500;

var TARGET_LOGIN_BG = ''; // "../data/"+  "st.jpg";

var sure_modal_action = null;

var LOCAL_STORAGE_PREFIX = '_jpr_';

var CONNECTION_TIMEOUT = 60; // time in seconds
var MAX_RETRIES = 20; // retries for sending message 

var DUPLICATE_INBOX={};

var MSG_EDITING = [];
    var _ME__FANCY = [['r','#f00'],['g','#0f0'],['b','#00f'],['y','#ff0'],
                      ['o','#880'],['w','#fff']];
    let _;
    for(let i=0; i<_ME__FANCY.length; ++i){
        _ = _ME__FANCY[i]
        MSG_EDITING.push(['^'+_[0]+'_', '<span style="color:'+_[1]+';">']);
        MSG_EDITING.push(['^'+_[0]+'l_', '<span style="color:'+_[1]+';font-size:1.6em;">']);

        MSG_EDITING.push(['^'+_[0]+'u_', '<span style="color:'+_[1]+';text-decoration:underline wavy;">']);
        MSG_EDITING.push(['^'+_[0]+'ul_', '<span style="color:'+_[1]+';text-decoration:underline wavy;font-size:1.6em;">']);
        MSG_EDITING.push(['^'+_[0]+'lu_', '<span style="color:'+_[1]+';text-decoration:underline wavy;font-size:1.6em;">']);

        MSG_EDITING.push(['^'+_[0]+'b_', '<span style="color:'+_[1]+';font-weight:bold;">']);
        MSG_EDITING.push(['^'+_[0]+'bl_', '<span style="color:'+_[1]+';font-weight:bold;font-size:1.6em;">']);
        MSG_EDITING.push(['^'+_[0]+'lb_', '<span style="color:'+_[1]+';font-weight:bold;font-size:1.6em;">']);


        MSG_EDITING.push(['^'+_[0]+'bu_', '<span style="color:'+_[1]+';font-weight:bold;text-decoration:underline wavy;">']);
        MSG_EDITING.push(['^'+_[0]+'bul_', '<span style="color:'+_[1]+';font-weight:bold;text-decoration:underline wavy;font-size:1.6em;">']);
        MSG_EDITING.push(['^'+_[0]+'blu_', '<span style="color:'+_[1]+';font-weight:bold;text-decoration:underline wavy;font-size:1.6em;">']);
        MSG_EDITING.push(['^'+_[0]+'lbu_', '<span style="color:'+_[1]+';font-weight:bold;text-decoration:underline wavy;font-size:1.6em;">']);

        MSG_EDITING.push(['^'+_[0]+'ub_', '<span style="color:'+_[1]+';font-weight:bold;text-decoration:underline wavy;">']);
        MSG_EDITING.push(['^'+_[0]+'ubl_', '<span style="color:'+_[1]+';font-weight:bold;text-decoration:underline wavy;font-size:1.6em;">']);
        MSG_EDITING.push(['^'+_[0]+'ulb_', '<span style="color:'+_[1]+';font-weight:bold;text-decoration:underline wavy;font-size:1.6em;">']);
        MSG_EDITING.push(['^'+_[0]+'lub_', '<span style="color:'+_[1]+';font-weight:bold;text-decoration:underline wavy;font-size:1.6em;">']);
    }

    // ^l_...^/l_: large string ie 1.6em. close with ^/_
    // for x in r[ed],g[reen],b[lue],y[ellow],o[range],w[hite]
    //      ^x_: x, ^xu_: x-underlined, ^xb_:x-bold, ^xub_:x-underlined-bold
    //      all these end with ^/_
    var _ME_EXTRAS = [
        ["^t",  "<span style='font-size:1.6em;'>"],
        ["^q",  "<span class='quoted'>"],
        ["^i",  "<span style='font-style:italic'>"],
        ["^b",  "<span style='font-weight:bold'>"],
        ["^u",  "<span style='text-decoration:underline wavy'>"],
        
        ["^l",  "<a href=\""], ["^/l","\">here</u>"], // links are special

        // slightly more complicated...
        ["^s",  "<span style=\"font-size:"],
        ["^c",  "<span style=\"color:"],        
        ["^.",  ";\">"], // used alongsie ^s and ^c

        ['^/', '</span>'], // general closing tag. MUST BE LAST IN THIS ARRAY
    ];
    for(let i=0; i<_ME_EXTRAS.length; ++i){
        MSG_EDITING.push(_ME_EXTRAS[i]);
    }

var CLICK_TIMER = null;

var DROPZONE_TARGET = null;

var MEDIA_LIMITS = {
    // all time in seconds
    audio: {limit:1, duration: 60*10},
    image: {limit:1},
    video: {limit:1, duration: 10, quality: 1}, // quality 0=low quality, video would be very small but not detailed enough
    
    chunksize: 256*1024, // chunk size to be used in uploads
                         // should be resettable in app

    default_chunksize: 1024*1024, // 1MB
};

var CAPTION_TARGET = null;

var staticCryptModule; // will represent the loaded staticCrypt wasm file
var staticCryptLoaded = false;
var staticCryptLoading = false;

var INBOX_LAST_FETCH = 0;

function generate_reference_id(fname){
    let xters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    xters += xters.toLowerCase();
    xters += "0123456789";
    
    let _id = "";
    
    let i=0;
    while(i<8){
        _id += xters[Math.floor(Math.random() * (xters.length-1 - 0 + 1) + 0)];
        ++i;
    }

    if(fname.indexOf('.')>=0){
        let _ = fname.split('.');
        _id += '.'+_[_.length-1];
    }
    
    return _id;
}

function activate_grp_chats(){
    for (var i=0; i<GROUPS.length; i++)
    {
        CHATS[GROUPS[i]]["chat-div"].style.display = "none";
    }
    
    document.getElementById("groups-div").style.display = "none";

    CHATS[this.grp]["chat-div"].style.display = "block";
    
    document.getElementById("chats").style.display = "block";
    
    ACTIVE_GROUP = this.grp;
    document.getElementById("_group").value=ACTIVE_GROUP;
    
    // scroll div to bottom...
    var objDiv = document.getElementById("chats-container-div");
    objDiv.scrollTop = objDiv.scrollHeight;
    
    document.getElementById("online_state").style.display = "block";
    
    check_online_status();
    
    //if (ACTIVE_GROUP!=LAST_ACTIVE_GROUP)
    {
        var theme_found = false;
        for(var i=0;i<USER_THEMES.length; ++i)
        {
            if(USER_THEMES[i][0]==ACTIVE_GROUP)
            {
                document.getElementById("theme").href = THEMES_PATH+USER_THEMES[i][1];    
                theme_found = true;
                break;
            }
        }
        
        if(!theme_found)
        {
            document.getElementById("theme").href = THEMES_PATH+DEFAULT_THEME;    
        }
    
        LAST_ACTIVE_GROUP = ACTIVE_GROUP;
    }
}

function show_groups(){
    if (!GROUPS.length)
    {
        flag_error("sorry, you are not in any active group!");
        return;
    }

    var div = document.getElementById("groups-div");
    document.getElementById("login-div").style.display = "none";
    document.getElementById("chats").style.display = "none";

    clear(div);
    
    div.style.display = "";
    
    var grp_div;
    for (var i=0; i<GROUPS.length; i++)
    {
        grp_div = document.createElement("div");
        grp_div.setAttribute("class","group");
        grp_div.innerHTML = GROUPS[i];
        
        grp_div.grp = GROUPS[i];
        
        grp_div.onclick = activate_grp_chats;
        
        div.appendChild(grp_div);
    }

    if(GROUPS.length==1)
    {
        grp_div.onclick();
        check_online_status();
    }

}

function beautify_msg(msg){
    // edit msgs for special inline visual changes...
    for(var mi=0; mi<MSG_EDITING.length; ++mi){
        while(msg.indexOf(MSG_EDITING[mi][0])>=0){msg = msg.replace(MSG_EDITING[mi][0],MSG_EDITING[mi][1]);}
    }
    return msg;
}

function unbeautify_msg(msg){
    for(var mi=0; mi<MSG_EDITING.length; ++mi){
        while(msg.indexOf(MSG_EDITING[mi][1])>=0){msg = msg.replace(MSG_EDITING[mi][1],MSG_EDITING[mi][0]);}
    }
    return msg;
}

// this function should be sure to decrypt he media(the server stored encrypted media data)
// should the server do the decryption and transfer decrypted data?
function media_html(msg){
    var innerHTML = "";
    if(
        msg.toLowerCase().indexOf(".jpg")>=0 ||
        msg.toLowerCase().indexOf(".jpeg")>=0 ||
        msg.toLowerCase().indexOf(".gif")>=0 ||
        msg.toLowerCase().indexOf(".png")>=0
        // image attachment
        )
    {
        innerHTML += "<div class=\"preload_media_div clickable\" mediatype=\"img\" data=\""+
                         msg+"\" "+
                         "onclick=\"start_loading_media(this)\">Picture</div>"+
                         "<div id=\""+msg+"\" style=\"height:100px;width:150px;border-radius:5px;display:none;\"></div><br>";
    }

    else if(
        msg.toLowerCase().indexOf(".3gpp")>=0 ||
        msg.toLowerCase().indexOf(".mp3")>=0  ||
        msg.toLowerCase().indexOf(".wav")>=0
        // audio attachment
        )
    {
        innerHTML += "<div class=\"preload_media_div clickable\" data=\""+
                         msg+"\" "+
                         "onclick=\"start_loading_media(this)\">Audio</div>"+
                         "<audio controls controlsList=\"nodownload\" style=\"max-width:100%; display:none;\" id=\""+
                         msg+
                         "\"><source src=\""+FILE_ATTACHMENT_PATH+msg+"\"> {brocken audio}</audio><br>";
    }

    else if(
        msg.toLowerCase().indexOf(".mp4")>=0 ||
        msg.toLowerCase().indexOf(".webm")>=0
        // video attachment
        )
    {
        innerHTML += "<div class=\"preload_media_div clickable\" data=\""+
                         msg+"\" "+
                         "onclick=\"start_loading_media(this)\">Video</div>"+
                         "<video controls controlsList=\"nodownload\" style=\"width:100%; display:none; margin-bottom:10px;\" id=\""+
                         msg+
                         "\"><source src=\""+FILE_ATTACHMENT_PATH+msg+"\"> {brocken video}</video><br>";
    }
    
    return innerHTML;

}

function attempted_login(){
    stop_loading();

    if (this.status===200){

        write_local_data('app_killed','yes',function(e){},function(v){});
        
        var reply, inbox;
        if(!this.local_data){
            reply = JSON.parse(this.responseText);

            if (!reply.status)
            {
                flag_error(reply.log);
                return;
            }

            //document.body.style.background = "#1f1212";

            write_local_data('login',{
                    uname:reply.uname,
                    pswd:this.login_data.pswd,
                    groups:reply.groups,
                    themes:reply.user_themes,
                    all_themes:reply.all_themes,
                    },
                function(){},function(){});

            inbox = JSON.parse(reply.inbox).inbox;

            // convert msgs to format we prefer here...
            let _msgs = {};
            let _msg_group;
            for(let _msg_count=0; _msg_count<inbox.length;++_msg_count){
                _msg_group = inbox[_msg_count][0];
                if(!_msgs.hasOwnProperty(_msg_group)){_msgs[_msg_group]=[];}
                _msgs[_msg_group].push(inbox[_msg_count]);
            }
            for(_msg_group in _msgs){
                if(_msgs.hasOwnProperty(_msg_group)){
                    if(_msgs[_msg_group].length>MAX_INBOX){
                        _msgs[_msg_group]=_msgs[_msg_group].slice(_msgs[_msg_group].length-MAX_INBOX, _msgs[_msg_group].length);
                    }
                }
            }

            write_local_data('msgs',_msgs,function(){},function(){});
        }else{reply = this.local_data; inbox = this.local_data.inbox;}
                
        var chats_div = document.getElementById("chats");
        var chat_div, date_div;

        GROUPS = reply.groups.sort();

        //if(GROUPS.indexOf("_fifi")>=0){GROUPS=["_fifi"]}

        for (var i=0; i<GROUPS.length; i++)
        {
            if(CHATS[GROUPS[i]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                CHATS[GROUPS[i]] = {
                    "chat-div":chat_div, 
                    'data':[],
                    'dates':[],
                    'times':[]
                };
                
                document.getElementById("chats-container-div").appendChild(chat_div);
            }
        }

        UNAME = reply.uname;
        document.getElementById("_sender").value = UNAME;
        
        //var inbox;
        //if(this.local_data){inbox=reply.inbox;}
        //else{inbox = JSON.parse(reply.inbox).inbox;}
                
        var chat, sender, msg, time_div;
        var _msg_data;
        var ext;
        
        var looped = false;
        for(var i=0; i<inbox.length; ++i)
        {
            looped = true;

            if(CHATS[inbox[i][0]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                CHATS[inbox[i][0]] = {
                    "chat-div":chat_div, 
                    'data':[inbox[i].slice(1,inbox[i].length)],
                    'dates':[],
                    'times':[inbox[i][2]]
                };

                document.getElementById("chats-container-div").appendChild(chat_div);
            }
            
            else
            {
                CHATS[inbox[i][0]].data.push(inbox[i].slice(1,inbox[i].length));
                CHATS[inbox[i][0]].times.push(inbox[i][2]);
            }

        }for(var grp in CHATS){if(CHATS.hasOwnProperty(grp)){
            let imsg;

            for(let i=((CHATS[grp].data.length>MAX_INBOX)?(CHATS[grp].data.length-MAX_INBOX):0); i<CHATS[grp].data.length; ++i){
                imsg = CHATS[grp].data[i];
                if(CHATS[grp].dates.indexOf(imsg[2])<0) // new major date found...
                {
                    CHATS[grp].dates.push(imsg[2]);
                    
                    date_div = document.createElement("div");
                    date_div.setAttribute("class","date");
                    date_div.innerHTML = imsg[2];
                    
                    CHATS[grp]["chat-div"].appendChild(date_div);
                }
                
                chat = document.createElement("div");
                sender = document.createElement("div"); sender.setAttribute("class","sender");
                msg = document.createElement("div"); msg.setAttribute("class","msg");
                time_div = document.createElement("div"); time_div.setAttribute("class","time");
                
                if (imsg[0]==UNAME) // outgoing message...
                {
                    chat.setAttribute("class","chat outgoing");
                    sender.innerHTML = "me";
                }
                else
                {
                    chat.setAttribute("class","chat incoming");
                    sender.innerHTML = imsg[0];
                }
                
                time_div.innerHTML = imsg[3];
                
                _msg_data = imsg[4].split(":~!.:");
                for (var j=0; j<(_msg_data.length-1); j++)
                {
                    msg.innerHTML += media_html(_msg_data[j]);
                } 

                var _msg = beautify_msg(_msg_data[_msg_data.length-1]);
                if(!SUPPORTS_EMOJIS){msg.innerHTML += _msg;}
                else{
                    if(_msg.indexOf("`")<0){msg.innerHTML += _msg;}
                    else{ // message has emojis
                        var _msg_parts = _msg.split("`");
                        var finished = [];
                        for(var mi=0; mi<_msg_parts.length;++mi){
                            if(_msg_parts[mi].length && !isNaN(parseInt(_msg_parts[mi])) && finished.indexOf(_msg_parts[mi])<0){
                                while(_msg.indexOf("`"+_msg_parts[mi]+"`")>=0){
                                    _msg = _msg.replace("`"+_msg_parts[mi]+"`",
                                        "<img class=\"emoji\" src=\""+EMOJI_PATH+_msg_parts[mi]+".png"+"\">"
                                    );
                                }
                                
                                finished.push(_msg_parts[mi]);
                            }
                        }
                        msg.innerHTML += _msg;
                    }
                }
                
                chat.appendChild(sender);
                chat.appendChild(msg);
                chat.appendChild(time_div);

                initSwipe(chat, function(swipe_data, msg){
                    if(swipe_data.resultant=="left"){quote_msg(msg);}
                },50,msg);

          
                CHATS[grp]["chat-div"].appendChild(chat);
            }
            }
    
        }
        
        if(looped)
        {
            var objDiv = document.getElementById("chats-container-div");
            objDiv.scrollTop = objDiv.scrollHeight;
        }


        USER_THEMES = reply.user_themes;
                
        var theme_div = document.getElementById("themes"); clear(theme_div);
        var theme;
        // all themes...
        for (var i=0; i<reply.all_themes.length; ++i)
        {
            theme = document.createElement("div");
            theme.setAttribute("class","theme");
            theme.theme = reply.all_themes[i][2];
            theme.innerHTML = ((i+1)>9?"":"0")+(i+1)+") "+reply.all_themes[i][0];
            theme.onclick = set_theme;
            
            if(i==(reply.all_themes.length-1)) // last theme
                theme.style.marginBottom = "0px";
            
            theme_div.appendChild(theme);
        }

        INBOX_READ_INTERVAL_VAR = setInterval(get_inbox, INBOX_READ_RATE*1000);
        get_inbox();

        show_groups();
        
    }
    else
    {
        flag_error("[logging in] status code "+this.status);
    }
}

function done_setting_theme(){
    stop_loading();
    
    if(this.status===200)
    {
        var reply = JSON.parse(this.responseText);
        if(!reply.status)
        {
            flag_error(reply.log);
            return;
        }

        var new_theme = this.theme;
        read_local_data('login',function(e){}, function(d){
            if(d){
                for(var _i=0; _i<d.themes.length; ++_i){
                    if(d.themes[_i][0]==ACTIVE_GROUP){
                        d.themes[_i][1] = new_theme;
                        break;
                    }
                }
                write_local_data('login',d,function(){},function(){});
            }
        });

        notify("updating theme...");
        document.getElementById("theme").href = THEMES_PATH+this.theme;

    }
    else
    {
        flag_error("[setting theme] status code "+this.status);
    }
}

function set_theme(){
    hide_modal("themes_modal");

    var req = new XMLHttpRequest();
    
    req.theme = this.theme;
    req.open("post", SET_THEME_URL, true);
    
    req.onload = done_setting_theme;
    
    var form = new FormData();
    form.append("uname", UNAME);
    form.append("group", ACTIVE_GROUP);
    form.append("theme", this.theme);
    
    req.send(form);
    
    start_loading();

}

function login(){
    read_local_data('login',_login,function(login_data){
        // login_data: {uname:STR, pswd:STR, themes:ARR, groups:ARR}

        if(!login_data){_login(); return;} //... no data stored yet
        if(
            (document.getElementById("uname").value!=login_data.uname) ||
            (document.getElementById("pswd").value!=login_data.pswd)){
                // we cant simply show errors here as a user might want to login as another user
                // on their device!
                _login();
                return;
        }

        var data = {uname:login_data.uname, groups:login_data.groups, user_themes:login_data.themes, all_themes:login_data.all_themes}
        read_local_data('msgs',function(e){}, function(msgs){
            data.inbox = []
            for(let _mgrp in msgs){
                if(msgs.hasOwnProperty(_mgrp)){
                    for(let _mi=0; _mi<msgs[_mgrp].length;++_mi){
                        data.inbox.push(msgs[_mgrp][_mi]);
                    }
                }
            }
            
            var reply = {status:200, local_data:data};
            reply.callback = attempted_login;
            reply.callback();
        });
    });
}

function _req_timeout(){
    /*
    req._retry_data = {
        mtd:'post', url:POST_MESSAGE_URL,form:new FormData(form)
    };
    */

    if(undefined==this._retry_data.trials){this._retry_data.trials=0;}

    if(MAX_RETRIES==this._retry_data.trials){
        this.onerror();
        return;
    }

    this._retry_data.trials++;
    
    this.open(this._retry_data.mtd, this._retry_data.url, true);

    this.send(this._retry_data.form);
    start_loading();
}

function _login(){
    var req = new XMLHttpRequest();
    
    req.open("post", LOGIN_URL, true);
    //req.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    
    req.onload = attempted_login;

    req.timeout = CONNECTION_TIMEOUT*1000; req.ontimeout=_req_timeout;
    req.onerror = connection_failed;
    
    var form = new FormData();
    form.append("uname", document.getElementById("uname").value);
    form.append("pswd", document.getElementById("pswd").value);
    
    req.login_data = {uname: document.getElementById("uname").value, pswd:document.getElementById("pswd").value};
    
    req._retry_data = {
        mtd:'post', url:LOGIN_URL,form:form
    };

    req.send(form);
    
    start_loading();

}

function sent_message(){
    close_emoji_div();

    stop_loading();

    if (this.status===200)
    {
        if(this.has_attachments)
            document.getElementById("caption").value = "";
        
        //document.getElementById('form').reset();
                
        var reply = JSON.parse(this.responseText);
        
        if (!reply.status)
        {
            flag_error(reply.log);
            return;
        }

        var chats_div = document.getElementById("chats");
        var chat_div, date_div;

        var inbox = [reply.msg];
        
        var chat, sender, msg, time_div;
        var _msg_data;
        var ext;
        
        for(var i=0; i<inbox.length; ++i)
        {
            if(CHATS[inbox[i][0]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                CHATS[inbox[i][0]] = {
                    "chat-div":chat_div, 
                    'data':[inbox[i].slice(1,inbox[i].length)],
                    'dates':[],
                    'times':[inbox[i][2]]
                };

                document.getElementById("chats-container-div").appendChild(chat_div);
            }
            
            else
            {
                if(CHATS[inbox[i][0]].times.indexOf(inbox[i][2])>=0) // this message has already been received
                    continue;
                    
                CHATS[inbox[i][0]].data.push(inbox[i].slice(1,inbox[i].length));
                CHATS[inbox[i][0]].times.push(inbox[i][2]);
            }
            
            if(CHATS[inbox[i][0]].dates.indexOf(inbox[i][3])<0) // new major date found...
            {
                CHATS[inbox[i][0]].dates.push(inbox[i][3]);
                
                date_div = document.createElement("div");
                date_div.setAttribute("class","date");
                date_div.innerHTML = inbox[i][3];
                
                CHATS[inbox[i][0]]["chat-div"].appendChild(date_div);
            }
            
            chat = document.createElement("div");
            sender = document.createElement("div"); sender.setAttribute("class","sender");
            msg = document.createElement("div"); msg.setAttribute("class","msg");
            time_div = document.createElement("div"); time_div.setAttribute("class","time");
            
            if (inbox[i][1]==UNAME) // outgoing message...
            {
                chat.setAttribute("class","chat outgoing");
                sender.innerHTML = "me";
            }
            else
            {
                chat.setAttribute("class","chat incoming");
                sender.innerHTML = inbox[i][1];
            }
            
            time_div.innerHTML = inbox[i][4];

            _msg_data = inbox[i][5].split(":~!.:");
            for (var j=0; j<(_msg_data.length-1); j++)
            {
                msg.innerHTML += media_html(_msg_data[j]);
            }

            var _msg = beautify_msg(_msg_data[_msg_data.length-1]);
            if(!SUPPORTS_EMOJIS){msg.innerHTML += _msg;}
            else{
                if(_msg.indexOf("`")<0){msg.innerHTML += _msg;}
                else{ // message has emojis
                    var _msg_parts = _msg.split("`");
                    var finished = [];
                    for(var mi=0; mi<_msg_parts.length;++mi){
                        if(_msg_parts[mi].length && !isNaN(parseInt(_msg_parts[mi])) && finished.indexOf(_msg_parts[mi])<0){
                            while(_msg.indexOf("`"+_msg_parts[mi]+"`")>=0){
                                _msg = _msg.replace("`"+_msg_parts[mi]+"`",
                                    "<img class=\"emoji\" src=\""+EMOJI_PATH+_msg_parts[mi]+".png"+"\">"
                                );
                            }
                            
                            finished.push(_msg_parts[mi]);
                        }
                    }
                    msg.innerHTML += _msg;
                }
            }


            chat.appendChild(sender);
            chat.appendChild(msg);
            chat.appendChild(time_div);

            initSwipe(chat, function(swipe_data, msg){
                if(swipe_data.resultant=="left"){quote_msg(msg);}
            },50,msg);
      
            CHATS[inbox[i][0]]["chat-div"].appendChild(chat);

        }
        
        // scroll div to bottom...
        var objDiv = document.getElementById("chats-container-div");
//        if(objDiv.scrollTop+objDiv.clientHeight+chat.clientHeight+12>=objDiv.scrollHeight){
            objDiv.scrollTop = objDiv.scrollHeight;
//        }else{ // still focused on content above. dont auto scroll as it may be annoying
//            
//        }
        
        read_local_data('msgs',null, function(msgs){
            if(!msgs){msgs={}}

            let _mgrp;
            for(var i=0; i<inbox.length; ++i){
                _mgrp=inbox[i][0];
                if(msgs.hasOwnProperty(_mgrp)){
                    msgs[_mgrp].push(inbox[i]);
                }else{
                    msgs[_mgrp]=[inbox[i]];
                }
                
                DUPLICATE_INBOX[inbox[i][2]]=true;
            }
            for(let _msg_group in msgs){
                if(msgs.hasOwnProperty(_msg_group)){
                    if(msgs[_msg_group].length>MAX_INBOX){
                        msgs[_msg_group]=msgs[_msg_group].slice(msgs[_msg_group].length-MAX_INBOX, msgs[_msg_group].length);
                    }
                }
            }

            write_local_data('msgs',msgs,function(){},function(){});
        });        
    }
    else
    {
        flag_error("[sending message] status code "+this.status);
    }
}


function send_message(){
    var grp = document.getElementById("__group__").value;
    grp = grp.length?":embedded:"+grp:grp;  

    var msg = document.getElementById("entry").value;
    document.getElementById("_group").value = ACTIVE_GROUP;
    document.getElementById("_sender").value = UNAME+grp;
    
    if(!msg.length)
    {
        show_info("please type something");
        return
    }

    if( document.getElementById("quoted").style.display=="block" &&
        document.getElementById("quoted_msg").innerHTML.length){
        msg = "^q"+document.getElementById("quoted_msg").innerHTML+"^/"+msg;
    }

    /*// edit msgs for special inline visual changes...
    for(var mi=0; mi<MSG_EDITING.length; ++mi){
        while(msg.indexOf(MSG_EDITING[mi][0])>=0){msg = msg.replace(MSG_EDITING[mi][0],MSG_EDITING[mi][1]);}
    }
    */

    msg = unbeautify_msg(msg);

    document.getElementById('_msg').value = msg;

    var req = new XMLHttpRequest();
    
    req.open("post", POST_MESSAGE_URL, true);
    
    req.has_attachments = false;
    req.onload = sent_message;

    req.timeout = CONNECTION_TIMEOUT*1000; req.ontimeout=_req_timeout;
    req.onerror = connection_failed;
    
    var form = document.getElementById("msgForm");

    req._retry_data = {
        mtd:'post', url:POST_MESSAGE_URL,form:new FormData(form)
    };

    req.send(new FormData(form));
    
    document.getElementById("entry").value = "";
    start_loading();

    close_emoji_div(); close_quote();
}

function cancel_attachment(){
    document.getElementById("caption").value = "";
    document.getElementById('form').reset();
    hide_modal("attachment_modal");
}

function send_message_with_attachment(){
    var grp = document.getElementById("__group__").value;
    grp = grp.length?":embedded:"+grp:grp;  

    hide_modal("attachment_modal");
    var msg = document.getElementById("caption").value;
    DROPZONE_TARGET.children[0].value = ACTIVE_GROUP;
    DROPZONE_TARGET.children[1].value = UNAME+grp;
    
    if( document.getElementById("quoted").style.display=="block" &&
        document.getElementById("quoted_msg").innerHTML.length){
        msg = "^q"+document.getElementById("quoted_msg").innerHTML+"^/"+msg;
    }

    if(!msg.length)
        msg = " "; // there MUST be a message

    /*// edit msgs for special inline visual changes...
    for(var mi=0; mi<MSG_EDITING.length; ++mi){
        while(msg.indexOf(MSG_EDITING[mi][0])>=0){msg = msg.replace(MSG_EDITING[mi][0],MSG_EDITING[mi][1]);}
    }
    */

    msg = unbeautify_msg(msg);

    DROPZONE_TARGET.children[2].value = msg;

    DROPZONE_TARGET.click(); // trigger click to start uploading files with Dropzone.js
    
    close_emoji_div(); close_quote();
}


function got_inbox(){
    if (this.status===200)
    {        
        var reply = JSON.parse(this.responseText);
        
        if (!reply.status)
        {
            flag_error(reply.log);
            return;
        }

        write_local_data('inbox_last_fetch',reply.inbox_last_fetch,function(){},function(){});

        var chats_div = document.getElementById("chats");
        var chat_div, date_div;

        var inbox = reply.inbox;
        
        if (!inbox.length)
            return
        
        var vibrated=false, notified=false;

        var chat, sender, msg, time_div;
        var _msg_data;
        var ext;
        
        for(var i=0; i<inbox.length; ++i){
            if(CHATS[inbox[i][0]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                CHATS[inbox[i][0]] = {
                    "chat-div":chat_div, 
                    'data':[inbox[i].slice(1,inbox[i].length)],
                    'dates':[],
                    'times':[inbox[i][2]]
                };

                document.getElementById("chats-container-div").appendChild(chat_div);
            }
            
            else
            {
                if(CHATS[inbox[i][0]].times.indexOf(inbox[i][2])>=0) // this message has already been received
                    continue;
                    
                CHATS[inbox[i][0]].data.push(inbox[i].slice(1,inbox[i].length));
                CHATS[inbox[i][0]].times.push(inbox[i][2]);
            }
            
            if(CHATS[inbox[i][0]].dates.indexOf(inbox[i][3])<0) // new major date found...
            {
                CHATS[inbox[i][0]].dates.push(inbox[i][3]);
                
                date_div = document.createElement("div");
                date_div.setAttribute("class","date");
                date_div.innerHTML = inbox[i][3];
                
                CHATS[inbox[i][0]]["chat-div"].appendChild(date_div);
            }
            
            chat = document.createElement("div");
            sender = document.createElement("div"); sender.setAttribute("class","sender");
            msg = document.createElement("div"); msg.setAttribute("class","msg");
            time_div = document.createElement("div"); time_div.setAttribute("class","time");
            
            if (inbox[i][1]==UNAME) // outgoing message...
            {
                chat.setAttribute("class","chat outgoing");
                sender.innerHTML = "me";
            }
            else
            {
                if((!vibrated) && document.getElementById("vibrate").innerHTML.indexOf(": On")>=0){
                    if(navigator.vibrate){
                        navigator.vibrate(500);
                        vibrated=true;
                    }
                }
                if ((!notified) && "Notification" in window) {
                  _notification_uname = inbox[i][1]
                  Notification.requestPermission(function (permission) {
                    // If the user accepts, let’s create a notification
                    if (permission === "granted") {
                      var notification = new Notification("PChat", {
                           tag: "message", 
                           body: "new msg from "+_notification_uname
                      }); 
                      notification.onshow  = function() {};
                      notification.onclose = function() {};
                      notification.onclick = function() {};
                    }
                    
                    notified = true;

                  });
                }

                chat.setAttribute("class","chat incoming");
                sender.innerHTML = inbox[i][1];
            }
            
            time_div.innerHTML = inbox[i][4];

            _msg_data = inbox[i][5].split(":~!.:");
            for (var j=0; j<(_msg_data.length-1); j++)
            {
                msg.innerHTML += media_html(_msg_data[j]);
            }

            var _msg = beautify_msg(_msg_data[_msg_data.length-1]);
            if(!SUPPORTS_EMOJIS){msg.innerHTML += _msg;}
            else{
                if(_msg.indexOf("`")<0){msg.innerHTML += _msg;}
                else{ // message has emojis
                    var _msg_parts = _msg.split("`");
                    var finished = [];
                    for(var mi=0; mi<_msg_parts.length;++mi){
                        if(_msg_parts[mi].length && !isNaN(parseInt(_msg_parts[mi])) && finished.indexOf(_msg_parts[mi])<0){
                            while(_msg.indexOf("`"+_msg_parts[mi]+"`")>=0){
                                _msg = _msg.replace("`"+_msg_parts[mi]+"`",
                                    "<img class=\"emoji\" src=\""+EMOJI_PATH+_msg_parts[mi]+".png"+"\">"
                                );
                            }
                            
                            finished.push(_msg_parts[mi]);
                        }
                    }
                    msg.innerHTML += _msg;
                }
            }
            
            chat.appendChild(sender);
            chat.appendChild(msg);
            chat.appendChild(time_div);

            initSwipe(chat, function(swipe_data, msg){
                if(swipe_data.resultant=="left"){quote_msg(msg);}
            },50,msg);
      
            CHATS[inbox[i][0]]["chat-div"].appendChild(chat);
            
        }
        
        // scroll div to bottom...
        var objDiv = document.getElementById("chats-container-div");
        objDiv.scrollTop = objDiv.scrollHeight;

        read_local_data('msgs',function(){}, function(msgs){
            if(!msgs){msgs={}}

            let _mgrp;
            for(var i=0; i<inbox.length; ++i){
                if(true==DUPLICATE_INBOX[inbox[i][2]]){
                    delete DUPLICATE_INBOX[inbox[i][2]];
                    continue;
                }
                _mgrp=inbox[i][0];
                if(msgs.hasOwnProperty(_mgrp)){
                    msgs[_mgrp].push(inbox[i]);
                }else{
                    msgs[_mgrp]=[inbox[i]];
                }
            }
            for(let _msg_group in msgs){
                if(msgs.hasOwnProperty(_msg_group)){
                    if(msgs[_msg_group].length>MAX_INBOX){
                        msgs[_msg_group]=msgs[_msg_group].slice(msgs[_msg_group].length-MAX_INBOX, msgs[_msg_group].length);
                    }
                }
            }

            write_local_data('msgs',msgs,function(){},function(){});
        });        
    }
    else
    {
        flag_error("[fetching inbox] status code "+this.status);
    }
}

function get_inbox(){
    
    var grp = document.getElementById("__group__").value;
    grp = grp.length?":embedded:"+grp:grp;  
    
    var req = new XMLHttpRequest();
    
    req.open("post", INBOX_URL, true);
    
    req.onload = got_inbox;
    
    var form = new FormData();
    form.append("uname", UNAME+grp);
    
    function _send_form(){req.send(form);}
    
    read_local_data('inbox_last_fetch',_send_form,function(inbox_last_fetch){
        form.append("inbox_last_fetch", inbox_last_fetch);
        _send_form();
    });
    
    //req.send(form);
    
}

function _to_calc(){
    clear(document.getElementById("groups-div"));
    clear(document.getElementById("chats-container-div"));

    if(document.getElementById("login-div").style.display == "block"){
        document.getElementById("calc_div").style.display = "block";
        document.getElementById("main_div").style.display = "none";
    }else{
        document.getElementById("uname").value="";
        document.getElementById("pswd").value="";
        
        GROUPS=[];
        ACTIVE_GROUP = "";
        UNAME = "";
        CHATS = {}
        
        clearInterval(INBOX_READ_INTERVAL_VAR);
        
        document.getElementById("groups-div").style.display = "none";
        document.getElementById("chats").style.display = "none";
        document.getElementById("login-div").style.display = "block";

        write_local_data('app_killed','no',function(e){},function(v){});
    }

    hide_modal("sure_modal");
}

function _to_grps(){
    ACTIVE_GROUP = "";

    document.getElementById("chats").style.display = "none";    
    document.getElementById("groups-div").style.display = "block";
    document.getElementById("theme").href = "static/index.css";    

    hide_modal("sure_modal");
}

function back(){
    if(
        ("block"==document.getElementById("calc_div").style.display)||
        (""==document.getElementById("calc_div").style.display)
    ){
        return; // in calc mode, no need for this
    }

    close_emoji_div(); close_quote();

    if (document.getElementById("preview_div").style.display == "block")
    {
        done_previewing();
        return;
    }
    
    if (__EMBEDDED__)
        return;
    
    if(GROUPS.length==1 && ACTIVE_GROUP.length)
        ACTIVE_GROUP = "";

    if ("none"==document.getElementById("chats").style.display) // logout...
    {
        if("block"==document.getElementById("login-div").style.display){
            document.getElementById("sure_modal_title").innerHTML = "Leave App";
        }else{
            document.getElementById("sure_modal_title").innerHTML = "Logout";
        }
        show_modal("sure_modal");
        sure_modal_action = _to_calc
    }

    else // return to groups...
    {        
        if(ACTIVE_GROUP){
            document.getElementById("sure_modal_title").innerHTML = "Leave Chat";
            show_modal("sure_modal");
            sure_modal_action = _to_grps;
        }else{
            document.getElementById("sure_modal_title").innerHTML = "Logout";
            show_modal("sure_modal");
            sure_modal_action = _to_calc;
        }
    }

    check_online_status();
}

// since media is all encrypted on the server, we gotta decrypt it before we can use it!
function _decrypt_media(target,url){
    var req = new XMLHttpRequest();
    req.open('get',url,true);
    req.responseType='arraybuffer';
    req.target = target;
    req.onload = function(){
        var encrypted = new Uint8Array(this.response);

        var c_array = staticCryptModule.asm.malloc(encrypted.byteLength);
        if(!c_array){
            //print("<br>malloc failed to allocate "+encrypted.byteLength+' bytes');
            flag_error("failed to load image to memory. do we have enough free RAM?");
            return;
        }
        
        staticCryptModule.HEAPU8.set(encrypted,c_array);
        
        // the decryption is performed twice as the server encrypts twice!
        staticCryptModule._wasm_static_decrypt(c_array,encrypted.byteLength);
        staticCryptModule._wasm_static_decrypt(c_array,encrypted.byteLength);
        
        var decrypted = new Uint8Array(staticCryptModule.HEAPU8.buffer,c_array,encrypted.byteLength);
        staticCryptModule.asm.free(c_array); /* VERY IMPRTANT */

        this.target.src = URL.createObjectURL(new Blob([decrypted]));
    }
    req.send();
}

function _loaded_static_crypt(){
    let media_div = this.media_div;
    // initialize staticCryptModule once wasm file has been fully loaded
    staticCrypt().then(function(module){
        staticCryptLoaded = true;
        stop_loading();
        staticCryptModule = module;
        start_loading_media(media_div);
    });
}
function _failed_loading_static_crypt(){
    stop_loading();
    document.head.removeChild(this);
    staticCryptLoading = false;
    _load_static_crypt(this.media_div,this.trials_left);
}
function _load_static_crypt(media_div,trials_left=3){
    notify('contacting server...');
    if(!trials_left){
        flag_error('failed to communicate to server. are we online?');
        return;
    }
    //let static_crypt_js = document.getElementById('static-crypt-js');
    let static_crypt_js = document.createElement('script');
    static_crypt_js.media_div = media_div;
    static_crypt_js.trials_left = --trials_left;
    static_crypt_js.onload = _loaded_static_crypt;
    static_crypt_js.onerror = _failed_loading_static_crypt;
    
    start_loading();
    staticCryptLoading = true;
    static_crypt_js.src = HOST+staticCryptURL;
    document.head.appendChild(static_crypt_js);
}

function start_loading_media(media_div){
    /*
    if(!staticCryptLoaded){
        if(!staticCryptLoading){_load_static_crypt(media_div);}
        return;
    }
    */

    var target = media_div.getAttribute("data");
    notify("loading media...");
    media_div.style.display = "none";
    
    if(media_div.getAttribute("mediatype")!="img"){
        document.getElementById(target).src=FILE_ATTACHMENT_PATH+target;
        //_decrypt_media(document.getElementById(target),FILE_ATTACHMENT_PATH+target);
    }
    else
    {
        var bgImg = new Image();
        bgImg.mom = document.getElementById(target);

        let d = document.createElement('div');
        d.setAttribute('class', 'lds-spinner');
        d.style.position = "absolute";
        d.style.left = "59px";
        d.style.top = "55px";
        d.innerHTML = "<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>";
        
        document.getElementById(target).parentNode.appendChild(d);
        bgImg.loading_div = d;

        bgImg.onload = img_loaded;
        bgImg.src = FILE_ATTACHMENT_PATH+target;
        //_decrypt_media(bgImg,FILE_ATTACHMENT_PATH+target);
    }
    document.getElementById(target).style.display = "block";

}

function img_loaded(){
    this.loading_div.parentNode.removeChild(this.loading_div);

    this.mom.style.background = "#333 url(\"" + this.src + "\") no-repeat";
    this.mom.style.backgroundPosition = "center";
    this.mom.style.backgroundSize = "cover";
    this.mom.bgImg = this;
    this.mom.onclick = preview_img;
}

function preview_img_loaded(){
    let img = document.getElementById("preview-img");
    let iw = img.width, ih = img.height;

    img._original_width = iw;
    img._original_height = ih;

    let mom = document.getElementById("preview_div")
    let mom_ch = mom.clientHeight, mom_cw = mom.clientWidth;

    // this best-initial-zoom logic works ONLY if the app is fixed in potrait
    // which it should anyway!
    if(iw>=ih){
        img.style.width = mom_cw+"px";
    }else{
        if(mom_cw >= (mom_ch*(iw/ih))){
            img.style.height = mom_ch+"px";
        }else{
            img.style.width = mom_cw+"px";
        }
    }

    // ensure image is always centered vertically
    if(img.height < mom_ch){
        img.style.marginTop = parseInt((mom_ch-img.height)/2) + "px";
    }else{
        img.style.marginTop = 0 + "px";
    }
}

function preview_img(){
    document.getElementById("main_div").style.opacity = "0.1";
    document.getElementById("preview-img").src = "";
    document.getElementById("preview-img").style.width = "";
    document.getElementById("preview-img").style.height = "";
/*    
    setTimeout(function(obj){
        document.getElementById("preview-img").src = obj.bgImg.src;
    }, 100, this);
*/
    document.getElementById("preview-img").src = this.bgImg.src;

    document.getElementById("preview_div").style.display = "block";    
}

function done_previewing(){
    document.getElementById("main_div").style.opacity = "1"
    document.getElementById("preview_div").style.display = "none";
}

function zoom(direction, scale=0){
    let img = document.getElementById("preview-img");

    if(
        ('out'==direction) && (img.width<=(img._original_width/2))||
        ('in'==direction) && (img.width>=(img._original_width*2))
    ){
        
        return
    }

    let iw = img.width, ih = img.height;
    if('in'==direction){
        img.style.width = (img.width*(scale?scale:1.1))+"px";
        img.style.height = (img.height*(scale?scale:1.1))+"px";
    }else{
        img.style.width = (img.width*(scale?scale:0.9))+"px";
        img.style.height = (img.height*(scale?scale:0.9))+"px";
    }

    let mom = document.getElementById("preview_div")
    let mom_ch = mom.clientHeight, mom_cw = mom.clientWidth;

    // ensure image is always centered vertically
    if(img.height < mom_ch){
        img.style.marginTop = parseInt((mom_ch-img.height)/2) + "px";
    }else{
        img.style.marginTop = 0 + "px";
    }

    // ensure zoom occurs at the center point

    mom.scrollTop = ((img.height>mom_ch) ? parseInt((mom.scrollTop/(mom_ch+(ih-mom_ch)))*(mom_ch+(img.height-mom_ch))) : 0);
    mom.scrollLeft = ((img.width>mom_cw) ? parseInt((mom.scrollLeft/(mom_cw+(iw-mom_cw)))*(mom_cw+(img.width-mom_cw))) : 0);
/*
    console.log(img.width, img.height);
    console.log(mom.scrollLeft, mom.offsetWidth, mom.scrollTop, mom.offsetHeight);
    console.log(mom.scrollHeight);
*/
}

function checked_online_status(){
    if (this.status===200)
    {
        if (this.responseText=="online" /*&& 
            document.getElementById("online_state").style.background=="red"*/)
            {
                document.getElementById("online_state").style.background = "green";
            }

        if (this.responseText=="offline" /*&& 
            document.getElementById("online_state").style.background=="green"*/)
            {
                document.getElementById("online_state").style.background = "red";
            }
    }
}

function check_online_status(){
    if(!ACTIVE_GROUP.length)
    // we only display group statuses not user statuses!
    {
        document.getElementById("online_state").style.background = "red";
        document.getElementById("online_state").style.display = "none";
        return;
    }

    if (document.getElementById("online_state").style.display == "none")
        document.getElementById("online_state").style.display = "block";

    var req = new XMLHttpRequest();
    
    req.open("post", ONLINE_STATE_URL, true);
    
    req.onload = checked_online_status;
    
    var form = new FormData();
    form.append("uname", UNAME);
    form.append("group", ACTIVE_GROUP);
    
    req.send(form);

    
}

function edited_account(){
    stop_loading();
    
    if (this.status===200)
    {
        var reply = JSON.parse(this.responseText);
        if(!reply.status)
        {
            flag_error(reply.log);
            return;
        }
        
        var new_pswd = this.new_pswd;
        read_local_data('login',function(e){}, function(d){
            if(d){
                d.pswd = new_pswd;
                write_local_data('login',d,function(){},function(){});
            }
        });
        
        show_success("password updated!");
    }
    
    else
    {
        flag_error("[updating account info] reply code: "+this.status);
    }
}

function edit_account(){
    hide_modal("settings_modal");

    swal({
          title: "Current Password",
          text: "Enter current password",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "new password"
        },
        
        function(current_pswd){
            if (current_pswd === false) {return false;} // clicked "cancel"

            if (current_pswd === "") 
            {
                swal.showInputError("Password cant be empty!");
                return false
            }

            swal({
                  title: "New Password",
                  text: "Enter your new password",
                  type: "input",
                  showCancelButton: true,
                  closeOnConfirm: false,
                  animation: "slide-from-top",
                  inputPlaceholder: "new password"
                },
                
                function(new_pswd){
                    if (new_pswd === false) {return false;} // clicked "cancel"

                    if (new_pswd === "") 
                    {
                        swal.showInputError("Password cant be empty!");
                        return false
                    }
                  
                    var req = new XMLHttpRequest();
                    req.new_pswd = new_pswd;

                    req.open("POST", UPDATE_ACCOUNT_URL, true);

                    req.onload = edited_account;

                    var form = new FormData();

                    // our form is built in such a way that we only edit the user's password
                    form.append("uname", UNAME);
                    form.append("pswd", current_pswd);
                    form.append("new_pswd", new_pswd);

                    req.send(form);
                    start_loading();
                }
            );          
        }
    );
}

function edited_max_inbox(){
    stop_loading();
    
    if (this.status===200)
    {
        var reply = JSON.parse(this.responseText);
        if(!reply.status)
        {
            flag_error(reply.log);
            return;
        }
        
        MAX_INBOX = parseInt(this.new_limit,10);
        write_local_data('inbox_limit',MAX_INBOX,function(){},function(){});
        
        show_success("updated max-inbox. the update will be effected when you login the next time");
    }
    
    else
    {
        flag_error("[updating max-inbox] reply code: "+this.status);
    }
}

function edit_max_inbox(){
    hide_modal("settings_modal");

    swal({
          title: "Inbox Limit",
          text: "enter inbox limit (current: "+MAX_INBOX+")",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "default: 150"
        },
        
        function(limit){
            if (limit === false) {return false;} // clicked "cancel"

            limit = limit.split(',');
            limit = limit.join('');

            if (limit === ""){
                swal.showInputError("please enter a number");
                return false
            }

            for(let i=0; i<limit.length; ++i){
                if(isNaN(parseInt(limit[i],10))){
                    flag_error('invalid value given');
                    return;
                }
            }

            limit = parseInt(limit,10);

            if(limit>MAX_INBOX_UPPER_LIMIT){
                flag_error('value must be below '+MAX_INBOX_UPPER_LIMIT);
                return;
            }
            
            var req = new XMLHttpRequest();
            req.new_limit = limit;

            req.open("POST", SET_MAX_INBOX_URL, true);

            req.onload = edited_max_inbox;

            var form = new FormData();

            // our form is built in such a way that we only edit the user's password
            form.append("uname", UNAME);
            form.append("max_inbox", limit);

            req.send(form);
            start_loading();
        }
    );          

}

function edit_upload_chunksize(){
    hide_modal("settings_modal");

    swal({
          title: "Upload Chunk Size",
          text: "chunksize(bytes) (current: "+MEDIA_LIMITS.chunksize+")",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "default: "+MEDIA_LIMITS.default_chunksize+" bytes"
        },
        
        function(chunksize){
            if (chunksize === false) {return false;} // clicked "cancel"

            if (chunksize === "") {
                swal.showInputError("please enter a number");
                return false
            }
            
            if(chunksize.indexOf('*')>0){ // format x*y*z is given eg 2*1024*1024 = 2MB
                chunksize = chunksize.split('*');
                let cs = 1;
                for(let i=0; i<chunksize.length; ++i){
                    cs *= parseInt(chunksize[i],10);
                    if(isNaN(cs)){
                        flag_error('failed to parse number');
                        return;
                    }
                }
                chunksize = cs;
            }else{
                chunksize = parseInt(chunksize,10);
                if(isNaN(chunksize)){
                    flag_error('failed to parse number');
                    return;
                }
            }

            if(chunksize<1024){
                flag_error('value should be >=1*1024 ie 1KB');
                return;
            }
            if(chunksize>(5*1024*1024)){
                flag_error('value should be <=5*1024*1024 ie 5MB');
                return;
            }

            start_loading();
            write_local_data('upload_chunksize',chunksize,function(e){
                stop_loading();
                flag_error('failed to update field');
            },function(v){
                stop_loading();
                MEDIA_LIMITS.chunksize = chunksize;
                show_success('updated field...');
            });
          
        }
    );          
}

function edit_calc_code(){
    hide_modal("settings_modal");

    swal({
          title: "Calc Magic Code",
          text: "current: "+CALC_EXIT_CODE,
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "default: "+CALC_EXIT_CODE
        },
        
        function(code){
            if (code === false) {return false;} // clicked "cancel"

            if (code === "") {
                swal.showInputError("please enter a code");
                return false;
            }

            let expected = '0123456789.()/x+-';
            for(let i=0; i<code.length; ++i){
                if(expected.indexOf(code[i])<0){
                    flag_error('unexpected calc item <'+code[i]+'>');
                    return false;
                }
            }

            start_loading();
            write_local_data('calc_code',code,null,function(v){
                CALC_EXIT_CODE = code;
                stop_loading();
                show_success('updated field...');
            });
            
            return true;
        }
    );          
}


function edit_vibration(div){
    if(div.innerHTML.indexOf(": On")>=0){
        div.innerHTML = "4) Vibration: Off";
        write_local_data('vibrate','Off',function(e){},function(v){});
    }else{
        div.innerHTML = "4) Vibration: On";
        if(navigator.vibrate){
            navigator.vibrate(500);
        }
        write_local_data('vibrate','On',function(e){},function(v){});
    }
}

function calc_input(){
    var cin = document.getElementById("calc_input");
    if(this.innerHTML=="Del"){
        if(cin.innerHTML.length){
            cin.innerHTML = cin.innerHTML.slice(0, cin.innerHTML.length-1);        
        }
    }else if(this.innerHTML=="="){
        if(cin.innerHTML==CALC_EXIT_CODE){
            cin.innerHTML = "";
            document.getElementById("calc_output").innerHTML = "";
            document.getElementById("calc_div").style.display = "none";
            document.getElementById("main_div").style.display = "block";
            
            resume_app();
            //document.body.style.background = '#1f1212 url("'+TARGET_LOGIN_BG+'") no-repeat';            
        }else{
            try{
                var res = eval(cin.innerHTML.replace("x","*"));
                if(isNaN(res)){
                    document.getElementById("calc_output").innerHTML = "error!";
                }else{
                    document.getElementById("calc_output").innerHTML = res.toFixed(3);
                    cin.innerHTML = res.toFixed(3);
                }
            }catch(e){
                document.getElementById("calc_output").innerHTML = "error!";
            }
        }
    }else{
        cin.innerHTML += this.innerHTML;
    }
}

function close_emoji_div(){
    document.getElementById("emoji_div").style.display = "none";
}function open_emoji_div(){
    document.getElementById("emoji_div").style.display = "block";
}

// swipe feature for back...
var _swipe = {startX:0,startY:0};

function initSwipe(element,callback,threshold=20, other){
    /*
        callback will be given one argument, swap_data in the form of
            {
                horizontal: "none|left|right",
                vertical  : "none|up|down",
                resultant : "none|left|right|up|down"
            }
        
        other: this data will be passed along to the callback

    */
    function _get_swipe_directions(dx,dy,threshold){
        dx = dx<0?((dx>-threshold)?0:dx):((dx<threshold)?0:dx);
        dy = dy<0?((dy>-threshold)?0:dx):((dy<threshold)?0:dy);
        
        var vertical_swipe = (dy>0)?"down":(dy<0?"up":"none");
        var horizontal_swipe = (dx>0)?"right":(dx<0?"left":"none");

        dy = dy<0?-1*dy:dy;
        dx = dx<0?-1*dx:dx;

        var direction = dy>dx?vertical_swipe:horizontal_swipe;

        var swipe_data = {horizontal:horizontal_swipe,vertical:vertical_swipe,resultant:direction}
        
        return swipe_data;
        
    }

    // mobile with touch events
    element.addEventListener("touchstart",function(e){
        e.stopPropagation();
        _swipe.startX=e.changedTouches[0].pageX; _swipe.startY=e.changedTouches[0].pageY;});
    element.addEventListener("touchend",function(e){
        e.stopPropagation();
        var dx = e.changedTouches[0].pageX-_swipe.startX, dy = e.changedTouches[0].pageY-_swipe.startY;
        callback(_get_swipe_directions(dx,dy,threshold), other);
    });

    // PC with mouse events...
    element.addEventListener("mousedown",function(e){
        e.stopPropagation();
        _swipe.startX=e.clientX; _swipe.startY=e.clientY;});
    element.addEventListener("mouseup",function(e){
        e.stopPropagation();
        var dx = e.clientX-_swipe.startX, dy = e.clientY-_swipe.startY
        callback(_get_swipe_directions(dx,dy,threshold), other);
    });
    
}

function quote_msg(msg){
    var quote = msg.innerHTML;
    
    while(quote.indexOf("onclick=\"start_loading_media(this)\"")>=0){
        quote = quote.replace("onclick=\"start_loading_media(this)\"","");
    }

    //if(quote.indexOf("<")>=0){quote="[attachment]"}
    //if(quote.length>40){quote=quote.slice(0,40)+"...";}

    document.getElementById('emoji_div').style.bottom="120px";

    document.getElementById('quoted_msg').innerHTML=quote;
    document.getElementById('quoted').style.display='block';

    document.getElementById('entry').focus();
}

function close_quote(){
    document.getElementById('emoji_div').style.bottom="40px";
    document.getElementById('quoted').style.display='none';
}

function write_local_data(key,value,errCallback,sucessCallback){
    localforage.setItem(LOCAL_STORAGE_PREFIX+key, value, function (err) {
        if(err){if(errCallback){errCallback(err);}}
        else{if(sucessCallback){sucessCallback(key);}}
    });

}
function read_local_data(key,errCallback,sucessCallback){
    localforage.getItem(LOCAL_STORAGE_PREFIX+key, function (err, value) {
        if(err){errCallback(err);}
        else{sucessCallback(value);}
    });    
}

function resume_app(){
    // on boot, determine if app was killed suddenly by the OS or if it was 
    // properly closed by the user
    
    read_local_data('_revision_',null,function(rev){
        console.log(rev);
        if(rev!=REVISION){
            write_local_data('_revision_',REVISION,null,null);
            write_local_data('login','',null,null);

        }else{
            read_local_data('app_killed',function(){}, function(value){
                if(!value){
                    write_local_data('app_killed','no',function(e){},function(v){});
                }else{
                    if('yes'==value){ // if application was killed suddenly by OS
                        read_local_data('login',_login,function(login_data){
                            // login_data: {uname:STR, pswd:STR, themes:ARR, groups:ARR}

                            if(!login_data){return;} //... no data stored yet

                            var data = {uname:login_data.uname, groups:login_data.groups, user_themes:login_data.themes, all_themes:login_data.all_themes}

                            read_local_data('msgs',null,function(msgs){
                                data.inbox = []
                                for(let _mgrp in msgs){
                                    if(msgs.hasOwnProperty(_mgrp)){
                                        for(let _mi=0; _mi<msgs[_mgrp].length;++_mi){
                                            data.inbox.push(msgs[_mgrp][_mi]);
                                        }
                                    }
                                }

                                var reply = {status:200, local_data:data};
                                reply.callback = attempted_login;
                                reply.callback();
                            });
                        });
                    }
                }
            });
        }
    });
}

function captureImage_vavcam(){ //using navigator camera
    function setOptions(srcType) {
        var options = {
            // Some common settings are 20, 50, and 100
            quality: 20,
            destinationType: Camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: srcType,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: true,
            correctOrientation: true  //Corrects Android orientation quirks
        }
        return options;
    }

    function createNewFileEntry(imgUri) {
        window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

            // JPEG file
            dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {

                // Do something with it, like write to it, upload it, etc.
                // writeFile(fileEntry, imgUri);
                console.log("got file: " + fileEntry.fullPath);
                // displayFileData(fileEntry.fullPath, "File copied to");

            }, onErrorCreateFile);

        }, onErrorResolveUrl);
    }

    function openCamera(selection) {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = setOptions(srcType);

        navigator.camera.getPicture(function cameraSuccess(imageUri) {
            show_info(imageUri);
        }, function cameraError(error) {
            flag_error("failed to take pic");
        }, options);
    }

    try{
        notify(navigator.camera);
        openCamera();
    }
    catch(e){
        setTimeout(notify, 1000, e);
    }
}

function _delete_captured_media(fullpath){
    var path, filename;

    path = fullpath.split("/");
    path = (path.slice(0,path.length-1)).join("/");

    filename = fullpath.split("/");
               filename = filename[filename.length-1];

    window.resolveLocalFileSystemURL(path, function(dir) {
        dir.getFile(filename, {create:true}, function(fileEntry) {
              fileEntry.remove(function(){
                  // The file has been removed succesfully
                  //notify("local file deleted");
              },function(error){
                  // Error deleting the file
                  notify('could not delete local file...' + JSON.stringify( error ));
              },function(){
                 // The file doesn't exist
                  notify('local file not found');
            });
        });
    });
}

function _upload_captured_media(mediaFiles, _msg_){
    close_emoji_div(); close_quote();

    var _grp_ = document.getElementById("__group__").value;
    _grp_ = _grp_.length?":embedded:"+_grp_:_grp_;  

    if(mediaFiles.length){
        //notify(mediaFiles[0].fullPath);
        var fullpath = mediaFiles[0].fullPath;
        var fname = mediaFiles[0].fullPath.split('/');
                    fname = fname[fname.length-1];

        function __upload(){
            window.resolveLocalFileSystemURL(
                fullpath,

                function readFile(fileEntry) {
                    fileEntry.file(function (file) {
                                                
                        var file_data = {
                            name: fname,
                            totalsize: file.size,
                            chunksize: MEDIA_LIMITS.chunksize,
                            start: 0,
                            //end: 0,
                            sent:0,
                            file:file,
                            read_from_blob:0,
                            _len_2_read:0,
                        };

                        var chunkReaderBlock = null;

                        function uploaded_chunk(){
                            if(this.status===200){
                                let chunk = this.chunk;
                                file_data.sent += file_data._len_2_read;//chunk.length;
                                
                                if(file_data.sent>=file_data.totalsize){
                                    document.getElementById("uploading").style.display = "none";

                                    let obj = {
                                        status:200,
                                        has_attachments:true,
                                        responseText:this.responseText,
                                        callback:sent_message,
                                    };
                                    
                                    obj.callback();
                                    _delete_captured_media(fullpath);

                                    return;
                                }

                                let _progress = ((file_data.sent/file_data.totalsize)*100).toFixed(2);
                                document.getElementById("upload_progress").innerHTML = _progress+"%";
                                document.getElementById("upload_slider").style.width = _progress+"%";

                                file_data.start += file_data._len_2_read;//chunk.length;

                                chunkReaderBlock(file_data.start,file_data.chunksize,file_data.file);
                            }else{
                                document.getElementById("uploading").style.display = "none";
                                notify("error: "+this.status+'log:'+this.responseText);
                            }
                        }

                        function parseFile(file, callback) {
                            var fileSize   = file.size;
                            var chunkSize  = MEDIA_LIMITS.chunksize;
                            var offset     = 0;
                            var self       = this; // we need a reference to the current object

                            var readEventHandler = function(evt) {
                                if (evt.target.error == null) {
                                      var formdata = new FormData();
                                      var xhr = new XMLHttpRequest();

                                      xhr.open('POST', CAPTURED_MEDIA_UPLOAD_URL, true);

                                      formdata.append('start', file_data.start);
                                      formdata.append('end', file_data.read_from_blob);
                                      formdata.append('file', new Blob([evt.target.result]), file_data.name);
                                      formdata.append('totalsize', file_data.totalsize);
                                      formdata.append('chunksize', file_data.chunksize);
                                      formdata.append('fname', file_data.name);
                                      formdata.append('read_from_blob', file_data.read_from_blob);

                                      formdata.append('group', ACTIVE_GROUP);
                                      formdata.append('sender', UNAME+_grp_);
                                      formdata.append('msg', _msg_);

                                      xhr.onload = uploaded_chunk;
                                      xhr.chunk  = evt.target.result;

                                      xhr.send(formdata);
                                } else {
                                    document.getElementById("uploading").style.display = "none";
                                    notify("Read error: " + evt.target.error);
                                    return;
                                }
                            }

                            chunkReaderBlock = function(_offset, length, _file) {
                                var r = new FileReader();

                                length = (_offset+length<=file_data.totalsize) ? length : file_data.totalsize-_offset;

                                file_data._len_2_read = length;

                                var blob = _file.slice(_offset, length+_offset);
                                r.onload = readEventHandler;
                                file_data.read_from_blob += length;
                                
                                //r.readAsText(blob);
                                r.readAsArrayBuffer(blob);
                            }

                            // now let's start the read with the first block
                            chunkReaderBlock(offset,chunkSize,file);
                        }

                        let _progress = (0.00).toFixed(2);
                        document.getElementById("upload_progress").innerHTML = _progress+"%";
                        document.getElementById("upload_slider").style.width = _progress+"%";
                        document.getElementById("uploading").style.display = "block";
                        
                        parseFile(file, uploaded_chunk);

                    }, function(e){
                        notify('failed to read file chunk...');
                    });
                },
                
                function(e){
                    flag_error("failed to read file. do we have permission?");
                }
            );
        }
        
        /*
        if(CAPTION_TARGET===captureVideo){
            // for videos, we gotta compress them first...
            // for some reason on android, we gotta wait ~100ms for the path
            // returned by media-capture to be available for video-editor
            setTimeout(function(){

                document.getElementById('video_compress_div').style.display = 'block';
                document.getElementById('video_compress_level').innerHTML = '0 %';
                
                function transcoded_video(new_path){
                    document.getElementById('video_compress_div').style.display = 'none';
                    notify('compressed video. now uploading');
                    fullpath = new_path;
                    __upload();
                }
                
                function failed_to_transcode_video(e){
                    document.getElementById('video_compress_div').style.display = 'none';
                    alert('failed to compress video: '+e);
                    __upload();
                }
                
                VideoEditor.transcodeVideo(
                    transcoded_video,
                    failed_to_transcode_video,
                    {
                        fileUri: fullpath,
                        outputFileName: fname,
                        outputFileType: VideoEditorOptions.OutputFileType.MPEG4,
                        optimizeForNetworkUse: VideoEditorOptions.OptimizeForNetworkUse.YES,
                        saveToLibrary: true,
                        deleteInputFile: true, // we dont want to keep any trails of our media
                        maintainAspectRatio: true,
                        videoBitrate: 1000000, // 1 megabit
                        audioChannels: 2,
                        audioSampleRate: 44100,
                        audioBitrate: 128000, // 128 kilobits
                        progress: function(level) {
                            document.getElementById('video_compress_level').innerHTML = level.toFixed(2)+' %';
                        }
                    }
                );
                
            }, 120);
        }else{
            __upload();
        }
        */
        // give fs ~100ms to prepare the file fully
        setTimeout(__upload, 120);
    }
}

function captureAudio(_msg_=""){
    // capture callback
    var captureSuccess = function(mediaFiles){
        try{
            _upload_captured_media(mediaFiles, _msg_);
        }catch(e){'cs: '+alert(e);}
    };

    // capture error callback
    var captureError = function(error) {
        navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
    };

    try{
        // start audio capture
        navigator.device.capture.captureAudio(captureSuccess,captureError,MEDIA_LIMITS.audio);
    }catch(e){
        notify(e);
    }
}

function captureImage(_msg_=""){
    // capture callback
    var captureSuccess = function(mediaFiles) {
        _upload_captured_media(mediaFiles, _msg_);
    };

    // capture error callback
    var captureError = function(error) {
        navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
    };

    try{
        // start audio capture
        navigator.device.capture.captureImage(captureSuccess, captureError, MEDIA_LIMITS.image);
    }catch(e){
        notify(e);
    }
}

function captureVideo(_msg_=""){
    // capture callback
    var captureSuccess = function(mediaFiles) {
        _upload_captured_media(mediaFiles, _msg_);
    };

    // capture error callback
    var captureError = function(error) {
        navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
    };

    try{
        // start video capture
        // limit video to 30 seconds
        navigator.device.capture.captureVideo(captureSuccess, captureError, MEDIA_LIMITS.video);
    }catch(e){
        notify(e);
    }
}



// *****************************************************************************
function init(){
    function fade_logo(){
        document.getElementById("logo").style.opacity = "0.2";
        
        setTimeout(unfade_logo, 1500);
    }
    function unfade_logo(){
        document.getElementById("logo").style.opacity = "1";
        setTimeout(fade_logo, 1500);
    }
    
    fade_logo();
    
    setTimeout(function _f(state){
        document.getElementById("online_state").style.opacity=state?".1":"1";
        setTimeout(_f,1000,!state);
    }, 2000, true);
    
    setInterval(check_online_status, CHECK_ONLINE_STATUS_RATE*1000);

    if (document.getElementById("__uname__").value.length){
        login_embedded(document.getElementById("__uname__").value, document.getElementById("__group__").value);
    }


    var calc_btns = document.getElementsByClassName("calc_btn");
    for(var i=0; i<calc_btns.length; ++i){
        calc_btns[i].onclick = calc_input;
    }

    document.addEventListener("keydown", function(e){if(e.keyCode == 27){
        e.preventDefault();
        e.stopPropagation();
        back();
        }}, false);

    document.getElementById("entry").addEventListener("keyup",function(e){e.preventDefault();if (e.keyCode === 13){send_message();}});

    { // emojis. these should be ignored if version doesnt yet support em
        function emoji_clicked(){
            var em = this.src.split("/");
            em = em[em.length-1];
            em = em.split(".png");
            em = "`"+em[0]+"`";

            var entry = document.getElementById("entry");

            if (document.selection) {
                // IE
                entry.focus();
                var sel = document.selection.createRange();
                sel.em = em;
            } else if (entry.selectionStart || entry.selectionStart === 0) {
                // Others
                var startPos = entry.selectionStart;
                var endPos = entry.selectionEnd;
                entry.value = entry.value.substring(0, startPos) +
                em +
                entry.value.substring(endPos, entry.value.length);
                entry.selectionStart = startPos + em.length;
                entry.selectionEnd = startPos + em.length;
                entry.focus();
            } else {
                entry.value += em;
            }

            this.style.backgroundColor = "#aaf";
            setTimeout(function(img){img.style.backgroundColor="";},100,this);
        }
        var emoji_div = document.getElementById("emoji_div");
        var img;

            // first load the smiley faces emojis
        var em_limit = 118;
        for(var i=89; i<=em_limit; ++i){
            img = document.createElement("img");
            img.src = EMOJI_PATH+i+".png";
            img.setAttribute("class","emoji clickable");
            img.onclick = emoji_clicked;
            
            emoji_div.appendChild(img);
        }

        // now load the erotic emojis
        em_limit = 88;
        for(var i=1; i<=em_limit; ++i){

            img = document.createElement("img");
            img.src = EMOJI_PATH+i+".png";
            img.setAttribute("class","emoji clickable");
            img.onclick = emoji_clicked;
            
            emoji_div.appendChild(img);
        }
        
        document.getElementById("entry").onclick=close_emoji_div;
    }

    document.getElementById("preview-img").onload = preview_img_loaded;

    read_local_data('vibrate',function(){}, function(value){
        if(!value){
            write_local_data('vibrate','On',function(e){},function(v){});
        }else{
            document.getElementById("vibrate").innerHTML = "4) Vibration: "+value;
        }
    });

    read_local_data('inbox_limit',function(){}, function(value){
        if(!value){
            write_local_data('inbox_limit',MAX_INBOX,function(e){},function(v){});
        }else{MAX_INBOX = value;}
    });

    read_local_data('upload_chunksize',function(){}, function(value){
        if(value){
            value = parseInt(value,10);
            MEDIA_LIMITS.chunksize = value;
        }else{
            value = MEDIA_LIMITS.default_chunksize;
            MEDIA_LIMITS.chunksize = value;
            write_local_data('upload_chunksize',value,function(e){},function(v){});            
        }
    });

    read_local_data('calc_code',function(){}, function(value){
        if(!value){
            write_local_data('calc_code',CALC_EXIT_CODE,function(e){},function(v){});
        }else{CALC_EXIT_CODE = value;}
    });


    // handle android back button..
    if(window.cordova){
        document.addEventListener("backbutton", function(e){
            e.stopPropagation();
            back();
        }, false);
    }else{ // in browser
        window.history.pushState({}, ''); // first add false prev-link
        
        // handle every time the user presses the back button to navigate backwords
        window.addEventListener('popstate', function() {
            window.history.pushState({}, '');
            back();
        })
    }


    try{
        window.plugins.preventscreenshot.disable(function(r){
            if(r){
                //notify("screenshots are disabled for this app!");
            }
        }, null);
    }catch(e){;}

    // PWA particulars
    if ('serviceWorker' in navigator) {
        // service worker script MUST be at root ie same dir as index.html
        navigator.serviceWorker.register('./serviceWorker-PWA.js');
    }

}

window.onload = function(){
    if(!("deviceready" in window)){init();}
    else{
        document.addEventListener("deviceready", function(){
            init();
        }, false);
    }

}
