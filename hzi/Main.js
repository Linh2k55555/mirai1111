'use strict';

//-[ Require config and use ]-!/

if (global.Fca.Require.FastConfig.Config != 'default') {
    //do ssth
}
const { execSync } = require('child_process');
const Language = global.Fca.Require.languageFile.find((/** @type {{ Language: string; }} */i) => i.Language == global.Fca.Require.FastConfig.Language).Folder.Index;
//-[ Require All Package Need Use ]-!/

var utils = global.Fca.Require.utils,
    logger = global.Fca.Require.logger,
    fs = global.Fca.Require.fs,
    getText = global.Fca.getText,
    log = global.Fca.Require.log,
    express = require("express")(),
    { join } = require('path'),
    cheerio = require("cheerio"),
    { readFileSync, writeFileSync } = require('fs-extra'),
    Database = require("./Extra/Database"),
    readline = require("readline"),
    chalk = require("chalk"),
    figlet = require("figlet"),
    os = require("os"),
    deasync = require('deasync'),
    Security = require("./Extra/Security/Base"),
    { getAll, deleteAll } = require('./Extra/ExtraGetThread'),
    ws = require('ws'),
    Websocket = require('./Extra/Src/Websocket'),
    Convert = require('ansi-to-html');
    

//-[ Set Variable For Process ]-!/

log.maxRecordSize = 100;
var checkVerified = null;
const Boolean_Option = ['online','selfListen','listenEvents','updatePresence','forceLogin','autoMarkDelivery','autoMarkRead','listenTyping','autoReconnect','emitReady'];

//-[ Set And Check Template HTML ]-!/

const css = readFileSync(join(__dirname, 'Extra', 'Html', 'Classic', 'style.css'));
const js = readFileSync(join(__dirname, 'Extra', 'Html', 'Classic', 'script.js'));

//-[ Function Generate HTML Template ]-!/

/**
 * It returns a string of HTML code.
 * @param UserName - The username of the user
 * @param Type - The type of user, either "Free" or "Premium"
 * @param link - The link to the music you want to play
 * @returns A HTML file
 */

function ClassicHTML(UserName,Type,link) {
    return `<!DOCTYPE html>
    <html lang="en" >
        <head>
        <meta charset="UTF-8">
        <title>Horizon</title>
        <link rel="stylesheet" href="./style.css">
    </head>
    <body>
        <center>
            <marquee><b>waiting for u :d</b></marquee>
            <h2>Horizon User Infomation</h2>
            <h3>UserName: ${UserName} | Type: ${Type}</h3>
            <canvas id="myCanvas"></canvas>
            <script  src="./script.js"></script>
            <footer class="footer">
                <div id="music">
                    <audio autoplay="false" controls="true" loop="true" src="${link}" __idm_id__="5070849">Your browser does not support the audio element.</audio>
                    <br><b>Session ID:</b> ${global.Fca.Require.Security.create().uuid}<br>
                    <br>Thanks For Using <b>Fca-Horizon-Remastered</b> - From <b>Kanzu</b> <3<br>
                </div>
            </footer>
            </div>
        </center>
    </html>
    </body>`
    //lazy to change
}



//-[ Stating Http Infomation ]-!/

express.set('DFP', (process.env.PORT || process.env.port || 80));

express.use(function(req, res, next) {
    switch (req.url.split('?')[0]) {
        case '/script.js': {
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.write(js);
            break;
        }
        case '/style.css': {
            res.writeHead(200, { 'Content-Type': 'text/css' });
                res.write(css);
            break;
        }
        default: {
            res.writeHead(200, "OK", { "Content-Type": "text/html" });
            res.write(ClassicHTML(global.Fca.Require.FastConfig.HTML.UserName, "Premium Access", global.Fca.Require.FastConfig.HTML.MusicLink));
        }
    }
    res.end();
})
var Server;
if (global.Fca.Require.FastConfig.HTML.HTML) Server= express.listen(express.get('DFP'));

function setOptions(globalOptions, options) {
    Object.keys(options).map(function(key) {
        switch (Boolean_Option.includes(key)) {
            case true: {
                globalOptions[key] = Boolean(options[key]);
                break;
            }
            case false: {
                switch (key) {
                    case 'pauseLog': {
                        if (options.pauseLog) log.pause();
                            else log.resume();
                        break;
                    }
                    case 'logLevel': {
                        log.level = options.logLevel;
                            globalOptions.logLevel = options.logLevel;
                        break;
                    }
                    case 'logRecordSize': {
                        log.maxRecordSize = options.logRecordSize;
                            globalOptions.logRecordSize = options.logRecordSize;
                        break;
                    }
                    case 'pageID': {
                        globalOptions.pageID = options.pageID.toString();
                        break;
                    }
                    case 'userAgent': {
                        globalOptions.userAgent = (options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
                        break;
                    }
                    case 'proxy': {
                        if (typeof options.proxy != "string") {
                            delete globalOptions.proxy;
                            utils.setProxy();
                        } else {
                            globalOptions.proxy = options.proxy;
                            utils.setProxy(globalOptions.proxy);
                        }
                        break;
                    }
                    default: {
                        log.warn("setOptions", "Unrecognized option given to setOptions: " + key);
                        break;
                    }
                }
                break;
            }
        }
    });
}

const path = require('path');
function buildAPI(globalOptions, html, jar) {
    const filePath = path.join(__dirname, 'response.html');
    fs.writeFileSync(filePath, html, 'utf8'); 
    let fb_dtsg = null;
    let irisSeqID = null;

    function extractFromHTML() {
        try {
            const $ = cheerio.load(html);

            $('script').each((i, script) => {
                if (!fb_dtsg) {
                    const scriptText = $(script).html() || '';
                    const patterns = [
                        /\["DTSGInitialData",\[\],{"token":"([^"]+)"}]/,
                        /\["DTSGInitData",\[\],{"token":"([^"]+)"/,
                        /"token":"([^"]+)"/,
                        /{\\"token\\":\\"([^\\]+)\\"/,
                        /,\{"token":"([^"]+)"\},\d+\]/,
                        /"async_get_token":"([^"]+)"/,
                        /"dtsg":\{"token":"([^"]+)"/,
                        /DTSGInitialData[^>]+>([^<]+)/
                    ];

                    for (const pattern of patterns) {
                        const match = scriptText.match(pattern);
                        if (match && match[1]) {
                            try {
                                const possibleJson = match[1].replace(/\\"/g, '"');
                                const parsed = JSON.parse(possibleJson);
                                fb_dtsg = parsed.token || parsed;
                            } catch {
                                fb_dtsg = match[1];
                            }
                            if (fb_dtsg) break;
                        }
                    }
                }
            });
            if (!fb_dtsg) {
                const dtsgInput = $('input[name="fb_dtsg"]').val();
                if (dtsgInput) fb_dtsg = dtsgInput;
            }
            const seqMatches = html.match(/irisSeqID":"([^"]+)"/);
            if (seqMatches && seqMatches[1]) {
                irisSeqID = seqMatches[1];
            }
            try {
                const jsonMatches = html.match(/\{"dtsg":({[^}]+})/);
                if (jsonMatches && jsonMatches[1]) {
                    const dtsgData = JSON.parse(jsonMatches[1]);
                    if (dtsgData.token) fb_dtsg = dtsgData.token;
                }
            } catch {
            }

            if (fb_dtsg) {
                logger.Normal("Đã tìm thấy fb_dtsg");
            }

        } catch (e) {
            logger.Warning("Lỗi khi tìm fb_dtsg:", e);
        }
    }
    extractFromHTML();
    var userID;
    var cookie = jar.getCookies("https://www.facebook.com");
    var maybeUser = cookie.filter(function(val) { return val.cookieString().split("=")[0] === "c_user"; });
    var maybeTiktik = cookie.filter(function(val) { return val.cookieString().split("=")[0] === "i_user"; });

    if (maybeUser.length === 0 && maybeTiktik.length === 0) {
        if (global.Fca.Require.FastConfig.AutoLogin) {
            return global.Fca.Require.logger.Warning(global.Fca.Require.Language.Index.AutoLogin, function() {
                global.Fca.Action('AutoLogin')
            });
        }
        else if (!global.Fca.Require.FastConfig.AutoLogin) {
            return global.Fca.Require.logger.Error(global.Fca.Require.Language.Index.ErrAppState);
        }
    }

    if (html.indexOf("/checkpoint/block/?next") > -1) log.warn("login", Language.CheckPointLevelI);

    if (maybeTiktik[0] && maybeTiktik[0].cookieString().includes('i_user')) {
        userID = maybeTiktik[0].cookieString().split("=")[1].toString();
    }
    else userID = maybeUser[0].cookieString().split("=")[1].toString();    
    
    process.env['UID'] = logger.Normal(getText(Language.UID,userID), userID);

    try {
        clearInterval(checkVerified);
    } catch (e) {
        console.log(e);
    }

    var clientID = (Math.random() * 2147483648 | 0).toString(16);

    let mqttEndpoint = `wss://edge-chat.facebook.com/chat?region=prn&sid=${userID}`;
    let region = "PRN";

    try {
        const endpointMatch = html.match(/"endpoint":"([^"]+)"/);
        if (endpointMatch) {
            mqttEndpoint = endpointMatch[1].replace(/\\\//g, '/');
            const url = new URL(mqttEndpoint);
            region = url.searchParams.get('region')?.toUpperCase() || "PRN";
        }
    } catch (e) {
        logger.Warning('Using default MQTT endpoint');
    }
        logger.Normal('Sửa lỗi bởi SATORU');
    var ctx = {
        userID: userID,
        jar: jar,
        clientID: clientID,
        globalOptions: globalOptions,
        loggedIn: true,
        access_token: 'NONE',
        clientMutationId: 0,
        mqttClient: undefined,
        lastSeqId: irisSeqID,
        syncToken: undefined,
        mqttEndpoint: mqttEndpoint,
        region: region,
        firstListen: true,
        fb_dtsg: fb_dtsg,
        req_ID: 0,
        callback_Task: {}
    };

    var api = {
        setOptions: setOptions.bind(null, globalOptions),
        getAppState: function getAppState() {
            return utils.getAppState(jar);
        }
    };

    var defaultFuncs = utils.makeDefaults(html, userID, ctx);

    api.getFreshDtsg = async function() {
        try {
            const res = await defaultFuncs.get('https://www.facebook.com/', jar, null, globalOptions);
            const $ = cheerio.load(res.body);
            let newDtsg;
            const patterns = [
                /\["DTSGInitialData",\[\],{"token":"([^"]+)"}]/,
                /\["DTSGInitData",\[\],{"token":"([^"]+)"/,
                /"token":"([^"]+)"/,
                /name="fb_dtsg" value="([^"]+)"/
            ];

            $('script').each((i, script) => {
                if (!newDtsg) {
                    const scriptText = $(script).html() || '';
                    for (const pattern of patterns) {
                        const match = scriptText.match(pattern);
                        if (match && match[1]) {
                            newDtsg = match[1];
                            break;
                        }
                    }
                }
            });

            if (!newDtsg) {
                newDtsg = $('input[name="fb_dtsg"]').val();
            }

            return newDtsg;
        } catch (e) {
            logger.Warning("Error getting fresh dtsg:", e);
            return null;
        }
    };

    api.postFormData = function(url, body) {
        return defaultFuncs.postFormData(url, ctx.jar, body);
    };

    fs.readdirSync(__dirname + "/src")
        .filter((File) => File.endsWith(".js") && !File.includes('Dev_'))
        .map((File) => {
            if (File == 'getThreadInfo.js' && global.Fca.Require.FastConfig.AntiGetInfo.AntiGetThreadInfo != true || 
                File == 'getUserInfo.js'  && global.Fca.Require.FastConfig.AntiGetInfo.AntiGetUserInfo != true) {
                api[File.split('.').slice(0, -1).join('.')] = require('./src/' + (File.includes('getThreadInfo') ? 'getThreadMain.js' : 'getUserInfoMain.js'))(defaultFuncs, api, ctx)
            }
            else {
                api[File.split('.').slice(0, -1).join('.')] = require('./src/' + File)(defaultFuncs, api, ctx)
            }
        });

    return {
        ctx,
        defaultFuncs, 
        api
    };
}

function makeLogin(jar, email, password, loginOptions, callback, prCallback) {
    return function(res) {
        var html = res.body,$ = cheerio.load(html),arr = [];

        $("#login_form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));

        arr = arr.filter(function(v) {
            return v.val && v.val.length;
        });
        var form = utils.arrToForm(arr);
            form.lsd = utils.getFrom(html, "[\"LSD\",[],{\"token\":\"", "\"}");
            form.lgndim = Buffer.from("{\"w\":1440,\"h\":900,\"aw\":1440,\"ah\":834,\"c\":24}").toString('base64');
            form.email = email;
            form.pass = password;
            form.default_persistent = '0';
            form.locale = 'en_US';     
            form.timezone = '240';
            form.lgnjs = ~~(Date.now() / 1000);

        html.split("\"_js_").slice(1).map((val) => {
            jar.setCookie(utils.formatCookie(JSON.parse("[\"" + utils.getFrom(val, "", "]") + "]"), "facebook"),"https://www.facebook.com")
        });

        logger.Normal(Language.OnLogin);
        return utils
            .post("https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110", jar, form, loginOptions)
            .then(utils.saveCookies(jar))
            .then(function(/** @type {{ headers: any; }} */res) {
                var headers = res.headers;  
                if (!headers.location) throw { error: Language.InvaildAccount };

                // This means the account has login approvals turned on.
                if (headers.location.indexOf('https://www.facebook.com/checkpoint/') > -1) {
                    logger.Warning(Language.TwoAuth);
                    var nextURL = 'https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php';

                    return utils
                        .get(headers.location, jar, null, loginOptions)
                        .then(utils.saveCookies(jar))
                        .then(function(res) {
                            if (!Database().get('ThroughAcc')) {
                                Database().set('ThroughAcc', email);
                            }
                            else {
                                if (String((Database().get('ThroughAcc'))).replace(RegExp('"','g'), '') != String(email).replace(RegExp('"','g'), '')) {
                                    Database().set('ThroughAcc', email);
                                    if (Database().get('Through2Fa')) {
                                        Database().delete('Through2Fa');
                                    }
                                }
                            }
                            var html = res.body,$ = cheerio.load(html), arr = [];
                            $("form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));
                            arr = arr.filter(v => { return v.val && v.val.length });
                            var form = utils.arrToForm(arr);
                            if (html.indexOf("checkpoint/?next") > -1) {
                                setTimeout(() => {
                                    checkVerified = setInterval((_form) => {}, 5000, {
                                        fb_dtsg: form.fb_dtsg,
                                        jazoest: form.jazoest,
                                        dpr: 1
                                    });
                                }, 2500);  
                                switch (global.Fca.Require.FastConfig.Login2Fa) {
                                    case true: {
                                        const question = question => {
                                            const rl = readline.createInterface({
                                                input: process.stdin,
                                                output: process.stdout
                                            });
                                            var done,answ;
                                                rl.question(question, answer => {
                                                    rl.close();
                                                    answ = answer;
                                                    done = true
                                                })
                                                deasync.loopWhile(function(){
                                                    return !done;
                                                });
                                            return answ;
                                        };
                                        try {
                                            const Old_Cookie = Database().get('Through2Fa');
                                                if (Old_Cookie) {
                                                    Old_Cookie.map(function(/** @type {{ key: string; value: string; expires: string; domain: string; path: string; }} */c) {
                                                        let str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
                                                        jar.setCookie(str, "http://" + c.domain);
                                                    });
                                                    let Form = utils.arrToForm(arr);
                                                        Form.lsd = utils.getFrom(html, "[\"LSD\",[],{\"token\":\"", "\"}");
                                                        Form.lgndim = Buffer.from("{\"w\":1440,\"h\":900,\"aw\":1440,\"ah\":834,\"c\":24}").toString('base64');
                                                        Form.email = email;
                                                        Form.pass = password;
                                                        Form.default_persistent = '0';
                                                        Form.locale = 'en_US';
                                                        Form.timezone = '240';
                                                        Form.lgnjs = ~~(Date.now() / 1000);
                                                    return utils
                                                        .post("https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110", jar, Form, loginOptions)
                                                        .then(utils.saveCookies(jar))
                                                    .then(function(res) {
                                                            let headers = res.headers
                                                                if (!headers['set-cookie'][0].includes('deleted')) {
                                                                    logger.Warning(Language.ErrThroughCookies, function() {
                                                                        Database().delete('Through2Fa');
                                                                    });
                                                                    process.exit(1);
                                                                }
                                                            if (headers.location && headers.location.indexOf('https://www.facebook.com/checkpoint/') > -1) {
                                                                return utils
                                                                    .get(headers.location, jar, null, loginOptions)
                                                                    .then(utils.saveCookies(jar))
                                                                .then(function(res) {
                                                                    var html = res.body,$ = cheerio.load(html), arr = [];
                                                                    $("form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));
                                                                    arr = arr.filter(v => { return v.val && v.val.length });
                                                                    var Form = utils.arrToForm(arr);

                                                                    if (html.indexOf("checkpoint/?next") > -1) {
                                                                        setTimeout(() => {
                                                                            checkVerified = setInterval((_form) => {}, 5000, {
                                                                                fb_dtsg: Form.fb_dtsg,
                                                                                jazoest: Form.jazoest,
                                                                                dpr: 1
                                                                            });
                                                                        }, 2500);

                                                                        if (!res.headers.location && res.headers['set-cookie'][0].includes('checkpoint')) {
                                                                            try {
                                                                                delete Form.name_action_selected;
                                                                                Form['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                                                return utils
                                                                                    .post(nextURL, jar, Form, loginOptions)
                                                                                    .then(utils.saveCookies(jar))
                                                                                    .then(function() {
                                                                                        Form['submit[This was me]'] = "This was me";
                                                                                        return utils.post(nextURL, jar, Form, loginOptions).then(utils.saveCookies(jar));
                                                                                    })
                                                                                    .then(function() {
                                                                                        delete Form['submit[This was me]'];
                                                                                        Form.name_action_selected = 'save_device';
                                                                                        Form['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                                                        return utils.post(nextURL, jar, Form, loginOptions).then(utils.saveCookies(jar));
                                                                                    })
                                                                                    .then(function(res) {
                                                                                        var headers = res.headers;
                                                                                        if (!headers.location && res.headers['set-cookie'][0].includes('checkpoint')) {
                                                                                            Database().delete('Through2Fa');
                                                                                            process.exit(1);
                                                                                        }
                                                                                        var appState = utils.getAppState(jar,false);
                                                                                        Database().set('Through2Fa', appState);
                                                                                        return loginHelper(appState, email, password, loginOptions, callback);
                                                                                    })
                                                                                .catch((e) => callback(e));
                                                                            }
                                                                            catch (e) {
                                                                                console.log(e)
                                                                            }
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        return utils.get('https://www.facebook.com/', jar, null, loginOptions).then(utils.saveCookies(jar));
                                                    })
                                                    .catch((e) => console.log(e));
                                                }
                                            }
                                        catch (e) {
                                            Database().delete('Through2Fa');
                                        }
                                        const Otp_code = require('totp-generator');
                                        const Code = global.Fca.Require.FastConfig.AuthString.includes('|') == false ? Otp_code(global.Fca.Require.FastConfig.AuthString.includes(" ") ? global.Fca.Require.FastConfig.AuthString.replace(RegExp(" ", 'g'), "") : global.Fca.Require.FastConfig.AuthString) :  question(Language.EnterSecurityCode); 
                                            try {
                                                const approvals = function(N_Code) { 
                                                    form.approvals_code = N_Code;
                                                    form['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                    var prResolve,prReject;
                                                    var rtPromise = new Promise((resolve, reject) => { prResolve = resolve; prReject = reject; });

                                                    if (typeof N_Code == "string") {
                                                        utils
                                                            .post(nextURL, jar, form, loginOptions)
                                                            .then(utils.saveCookies(jar))
                                                        .then(function(res) {
                                                            var $ = cheerio.load(res.body);
                                                            var error = $("#approvals_code").parent().attr("data-xui-error");
                                                            if (error) {
                                                                logger.Warning(Language.InvaildTwoAuthCode,function() { approvals(question(Language.EnterSecurityCode)) }); //bruh loop
                                                            };
                                                        })
                                                        .then(function() {
                                                            delete form.no_fido;delete form.approvals_code;
                                                            form.name_action_selected = 'save_device'; //'save_device' || 'dont_save;
                                                            return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                                        }) 
                                                        .then(function(res) {
                                                            var headers = res.headers;
                                                            if (!headers.location && res.headers['set-cookie'][0].includes('checkpoint')) {
                                                                try {
                                                                    delete form.name_action_selected;
                                                                    form['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                                    return utils
                                                                        .post(nextURL, jar, form, loginOptions)
                                                                        .then(utils.saveCookies(jar))
                                                                        .then(function() {
                                                                            form['submit[This was me]'] = "This was me";
                                                                            return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                                                        })
                                                                        .then(function() {
                                                                            delete form['submit[This was me]'];
                                                                            form.name_action_selected = 'save_device';
                                                                            form['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                                            return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                                                        })
                                                                        .then(function(res) {
                                                                            var headers = res.headers;
                                                                            if (!headers.location && res.headers['set-cookie'][0].includes('checkpoint')) throw { error: "wtf ??:D" };
                                                                            var appState = utils.getAppState(jar,false);
                                                                            Database().set('Through2Fa', appState);
                                                                            return loginHelper(appState, email, password, loginOptions, callback);
                                                                        })
                                                                    .catch((e) => callback(e));
                                                                }
                                                                catch (e) {
                                                                    console.log(e)
                                                                }
                                                            }
                                                            var appState = utils.getAppState(jar,false);
                                                            if (callback === prCallback) {
                                                                callback = function(err, api) {
                                                                    if (err) return prReject(err);
                                                                    return prResolve(api);
                                                                };
                                                            }
                                                            Database().set('Through2Fa', appState);
                                                            return loginHelper(appState, email, password, loginOptions, callback);
                                                        })
                                                        .catch(function(err) {
                                                                if (callback === prCallback) prReject(err);
                                                                else callback(err);
                                                        });
                                                    }
                                                    else {
                                                        utils
                                                            .post("https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php", jar, form, loginOptions, null, { "Referer": "https://www.facebook.com/checkpoint/?next" })
                                                            .then(utils.saveCookies(jar))
                                                        .then(function(res) {
                                                            try { 
                                                                JSON.parse(res.body.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, ""));
                                                            } catch (ex) {
                                                                clearInterval(checkVerified);
                                                                logger.Warning(Language.VerifiedCheck);
                                                                if (callback === prCallback) {
                                                                    callback = function(err, api) {
                                                                        if (err) return prReject(err);
                                                                        return prResolve(api);
                                                                    };
                                                                }
                                                                let appState = utils.getAppState(jar,false);
                                                                return loginHelper(appState, email, password, loginOptions, callback);
                                                            }
                                                        })
                                                        .catch((ex) => {
                                                            log.error("login", ex);
                                                            if (callback === prCallback) prReject(ex);
                                                            else callback(ex);
                                                        });
                                                    }
                                                    return rtPromise;
                                                }
                                                return approvals(Code)
                                            }
                                            catch (e) {
                                                logger.Error(e)
                                                logger.Error();
                                                process.exit(0);
                                            }
                                        } 
                                    case false: {
                                        throw {
                                            error: 'login-approval',
                                            continue: function submit2FA(code) {
                                                form.approvals_code = code;
                                                form['submit[Continue]'] = $("#checkpointSubmitButton").html(); //'Continue';
                                                var prResolve,prReject;
                                                var rtPromise = new Promise((resolve, reject) => { prResolve = resolve; prReject = reject; });
                                                if (typeof code == "string") {
                                                    utils
                                                        .post(nextURL, jar, form, loginOptions)
                                                        .then(utils.saveCookies(jar))
                                                        .then(function(/** @type {{ body: string | Buffer; }} */res) {
                                                            var $ = cheerio.load(res.body);
                                                            var error = $("#approvals_code").parent().attr("data-xui-error");
                                                            if (error) {
                                                                throw {
                                                                    error: 'login-approval',
                                                                    errordesc: Language.InvaildTwoAuthCode,
                                                                    lerror: error,
                                                                    continue: submit2FA
                                                                };
                                                            }
                                                        })
                                                        .then(function() {
                                                            delete form.no_fido;delete form.approvals_code;
                                                            form.name_action_selected = 'dont_save'; //'save_device' || 'dont_save;
                                                            return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                                        })
                                                        .then(function(res) {
                                                            var headers = res.headers;
                                                            if (!headers.location && res.headers['set-cookie'][0].includes('checkpoint')) throw { error: Language.ApprovalsErr };
                                                            var appState = utils.getAppState(jar,false);
                                                            if (callback === prCallback) {
                                                                callback = function(err, api) {
                                                                    if (err) return prReject(err);
                                                                    return prResolve(api);
                                                                };
                                                            }
                                                            return loginHelper(appState, email, password, loginOptions, callback);
                                                        })
                                                        .catch(function(err) {
                                                            if (callback === prCallback) prReject(err);
                                                            else callback(err);
                                                        });
                                                } else {
                                                    utils
                                                        .post("https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php", jar, form, loginOptions, null, { "Referer": "https://www.facebook.com/checkpoint/?next" })
                                                        .then(utils.saveCookies(jar))
                                                        .then((res) => {
                                                            try { 
                                                                JSON.parse(res.body.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, ""));
                                                            } catch (ex) {
                                                                clearInterval(checkVerified);
                                                                logger.Warning(Language.VerifiedCheck);
                                                                if (callback === prCallback) {
                                                                    callback = function(err, api) {
                                                                        if (err) return prReject(err);
                                                                        return prResolve(api);
                                                                    };
                                                                }
                                                                return loginHelper(utils.getAppState(jar,false), email, password, loginOptions, callback);
                                                            }
                                                        })
                                                        .catch((ex) => {
                                                            log.error("login", ex);
                                                            if (callback === prCallback) prReject(ex);
                                                            else callback(ex);
                                                        });
                                                    }
                                                return rtPromise;
                                            }
                                        };
                                    }
                                }
                            } else {
                                if (!loginOptions.forceLogin) throw { error: Language.ForceLoginNotEnable };

                                if (html.indexOf("Suspicious Login Attempt") > -1) form['submit[This was me]'] = "This was me";
                                else form['submit[This Is Okay]'] = "This Is Okay";

                                return utils
                                    .post(nextURL, jar, form, loginOptions)
                                    .then(utils.saveCookies(jar))
                                    .then(function() {
                                        form.name_action_selected = 'dont_save';

                                        return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                    })
                                    .then(function(res) {
                                        var headers = res.headers;

                                        if (!headers.location && res.body.indexOf('Review Recent Login') > -1) throw { error: "Something went wrong with review recent login." };

                                        var appState = utils.getAppState(jar,false);

                                        return loginHelper(appState, email, password, loginOptions, callback);
                                    })
                                    .catch((e) => callback(e));
                            }
                        });
                }
            return utils.get('https://www.facebook.com/', jar, null, loginOptions).then(utils.saveCookies(jar));
        });
    };
}

//-[ Function backup ]-!/

/**
 * @param {string} data
 * @param {any} globalOptions
 * @param {any} callback
 * @param {any} prCallback
 */

function backup(data,globalOptions, callback, prCallback) {
    try {
        var appstate;
        try {
            appstate = JSON.parse(data)
        }
        catch(e) {
            appstate = data;
        }
            logger.Warning(Language.BackupNoti);
        try {
            loginHelper(appstate,null,null,globalOptions, callback, prCallback)
        }
        catch (e) {
            logger.Error(Language.ErrBackup);
            process.exit(0);
        }
    }
    catch (e) {
        return logger.Error();
    }
}

function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
    var mainPromise = null;
    var jar = utils.getJar();

    try {
        if (appState) {
            logger.Normal(Language.OnProcess);
            
            // Handle app state encryption/decryption
            try {
                switch (global.Fca.Require.FastConfig.EncryptFeature) {
                    case true: {
                        appState = JSON.parse(JSON.stringify(appState, null, "\t"));
                        switch (utils.getType(appState)) {
                            case "Array": {
                                switch (utils.getType(appState[0])) {
                                    case "Object": {
                                        logger.Normal(Language.NotReadyToDecrypt);
                                    }
                                        break;
                                    case "String": {
                                        appState = Security(appState,process.env['FBKEY'],'Decrypt');
                                        logger.Normal(Language.DecryptSuccess);
                                    }
                                        break;
                                    default: {
                                        logger.Warning(Language.InvaildAppState);
                                        process.exit(0)
                                    }
                                }
                            }
                                break;
                            default: {
                                logger.Warning(Language.InvaildAppState);
                                process.exit(0)
                            }
                        } 
                    }
                        break;
                    case false: {
                        switch (utils.getType(appState)) { 
                            case "Array": {
                                switch (utils.getType(appState[0])) {
                                    case "Object": {
                                        logger.Normal(Language.EncryptStateOff);
                                    }
                                        break;
                                    case "String": {
                                        appState = Security(appState,process.env['FBKEY'],'Decrypt');
                                        logger.Normal(Language.EncryptStateOff);
                                        logger.Normal(Language.DecryptSuccess);
                                    }
                                        break;
                                    default: {
                                        logger.Warning(Language.InvaildAppState);
                                        process.exit(0)
                                    }
                                }
                            }
                                break;
                            default: {
                                logger.Warning(Language.InvaildAppState);
                                process.exit(0)
                            }
                        } 
                    }
                        break;
                    default: {
                        logger.Warning(getText(Language.IsNotABoolean,global.Fca.Require.FastConfig.EncryptFeature))
                        process.exit(0);
                    }
                }
            }
            catch (e) {
                console.log(e);
            }

            try {
                appState = JSON.parse(appState);
            }
            catch (e) {
                try {
                    appState = appState;
                }
                catch (e) {
                    return logger.Error();
                }
            }

            try {
                global.Fca.Data.AppState = appState;
                appState.map(function(c) {
                    var str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
                    jar.setCookie(str, "http://" + c.domain);
                });
                Database().set('Backup', appState);
                mainPromise = utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true }).then(utils.saveCookies(jar));
            } 
            catch (e) {
                if (Database().has('Backup')) {
                    return backup(Database().get('Backup'), globalOptions, callback, prCallback);
                }
                else {
                    logger.Warning(Language.ErrBackup);
                    process.exit(0);
                }
            }
        }   
        else {
            mainPromise = utils
                .get("https://www.facebook.com/", null, null, globalOptions, { noRef: true })
                .then(utils.saveCookies(jar))
                .then(makeLogin(jar, email, password, globalOptions, callback, prCallback))
                .then(function() {
                    return utils.get('https://www.facebook.com/', jar, null, globalOptions).then(utils.saveCookies(jar));
                });
        }
    } catch (e) {
        console.log(e);
    }

    // Simplified redirect handling
    function handleRedirect(res) {
        var reg = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/;
        var redirect = reg.exec(res.body);
        if (redirect && redirect[1]) {
            return utils.get(redirect[1], jar, null, globalOptions).then(utils.saveCookies(jar));
        }
        return res;
    }

    var ctx, api;
    mainPromise = mainPromise
        .then(handleRedirect)
        .then(function(res) {
            // Handle mobile user agent if needed
            let Regex_Via = /MPageLoadClientMetrics/gs; 
            if (!Regex_Via.test(res.body)) {
                globalOptions.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
                return utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true }).then(utils.saveCookies(jar));
            }
            return res;
        })
        .then(handleRedirect)
        .then(function(res) {
            var html = res.body;
            var Obj = buildAPI(globalOptions, html, jar);
            ctx = Obj.ctx;
            api = Obj.api;
            return res;
        });

    if (globalOptions.pageID) {
        mainPromise = mainPromise
            .then(function() {
                return utils.get('https://www.facebook.com/' + ctx.globalOptions.pageID + '/messages/?section=messages&subsection=inbox', ctx.jar, null, globalOptions);
            })
            .then(function(resData) {
                var url = utils.getFrom(resData.body, 'window.location.replace("https:\\/\\/www.facebook.com\\', '");').split('\\').join('');
                url = url.substring(0, url.length - 1);
                return utils.get('https://www.facebook.com' + url, ctx.jar, null, globalOptions);
            });
    }

    mainPromise
        .then(async() => { 
            logger.Normal(Language.WishMessage[Math.floor(Math.random()*Language.WishMessage.length)]);
            require('./Extra/ExtraUptimeRobot')();
            callback(null, api);
        })
        .catch(function(e) {
            log.error("login", e.error || e);
            callback(e);
        });
}

function setUserNameAndPassWord() {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.clear();
    console.log(figlet.textSync('Horizon', {font: 'ANSI Shadow',horizontalLayout: 'default',verticalLayout: 'default',width: 0,whitespaceBreak: true }));
    console.log(chalk.bold.hex('#9900FF')("[</>]") + chalk.bold.yellow(' => ') + "Operating System: " + chalk.bold.red(os.type()));
    console.log(chalk.bold.hex('#9900FF')("[</>]") + chalk.bold.yellow(' => ') + "Machine Version: " + chalk.bold.red(os.version()));
    console.log(chalk.bold.hex('#9900FF')("[</>]") + chalk.bold.yellow(' => ') + "Fca Version: " + chalk.bold.red(global.Fca.Version) + '\n');
    try {
        rl.question(Language.TypeAccount, (Account) => {
            if (!Account.includes("@") && global.Fca.Require.utils.getType(parseInt(Account)) != "Number") return logger.Normal(Language.TypeAccountError, function () { process.exit(1) }); //Very Human
                else rl.question(Language.TypePassword, function (Password) {
                    rl.close();
                    try {
                        Database().set("Account", Account);
                        Database().set("Password", Password);
                    }
                    catch (e) {
                        logger.Warning(Language.ErrDataBase);
                            logger.Error();
                        process.exit(0);
                    }
                    if (global.Fca.Require.FastConfig.ResetDataLogin) {
                        global.Fca.Require.FastConfig.ResetDataLogin = false;
                        global.Fca.Require.fs.writeFileSync(process.cwd() + '/FastConfigFca.json', JSON.stringify(global.Fca.Require.FastConfig, null, 4));
                    }
                logger.Success(Language.SuccessSetData);
                process.exit(1);
            });
        })
    }
    catch (e) {
        logger.Error(e)
    }
}


function login(loginData, options, callback) {
    if (utils.getType(options) === 'Function' || utils.getType(options) === 'AsyncFunction') {
        callback = options;
        options = {};
    }

    var globalOptions = {
        selfListen: false,
        listenEvents: true,
        listenTyping: false,
        updatePresence: false,
        forceLogin: false,
        autoMarkDelivery: false,
        autoMarkRead: false,
        autoReconnect: true,
        logRecordSize: 100,
        online: false,
        emitReady: false,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    };
    
    var prCallback = null;
    if (utils.getType(callback) !== "Function" && utils.getType(callback) !== "AsyncFunction") {
        var rejectFunc = null;
        var resolveFunc = null;
        var returnPromise = new Promise(function(resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        }); 
        prCallback = function(error, api) {
            if (error) return rejectFunc(error);
            return resolveFunc(api);
        };
        callback = prCallback;
    }

    if (loginData.email && loginData.password) {
        setOptions(globalOptions, {
            logLevel: "silent",
            forceLogin: true,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        });
        loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
    }
    else if (loginData.appState) {
        setOptions(globalOptions, options);
        let All = (getAll()).filter(i => i.data.messageCount !== undefined);
            if (All.length >= 1) {
                deleteAll(All.map(obj => obj.data.threadID));
            }
        
        switch (global.Fca.Require.FastConfig.AutoLogin) {
            case true: {
                if (global.Fca.Require.FastConfig.ResetDataLogin) return setUserNameAndPassWord();
                else {
                    try {
                        const TempState = Database().get("TempState")
                        if (TempState) { 
                            try {
                                loginData.appState = JSON.parse(TempState);
                            }
                            catch (_) {
                                loginData.appState = TempState;
                            }
                            Database().delete("TempState");
                        }
                    }
                    catch (e) {
                        console.log(e)
                        Database().delete("TempState");
                            logger.Warning(Language.ErrDataBase);
                            logger.Error();
                        process.exit(0);
                    }
                    try {
                        if (Database().has('Account') && Database().has('Password')) return loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
                        else return setUserNameAndPassWord();
                    }
                    catch (e) {
                        console.log(e)
                        logger.Warning(Language.ErrDataBase);
                            logger.Error();
                        process.exit(0);
                    }
                }
            }
            case false: {
                return loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
            }
        }
    }
    return returnPromise;
}
function handleLoginError(error) {
  if (error && error.message && error.message.includes('getaddrinfo ENOTFOUND mbasic.facebook.com')) {
    console.log('Đã phát hiện lỗi kết nối đến mbasic.facebook.com');
    restartBot();
  } else {
    console.error('Lỗi đăng nhập:', error);
  }
}

function restartBot() {
  console.log('Đang khởi động lại bot...');
  try {
    execSync('node index.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Không thể khởi động lại bot:', error);
  }
}
module.exports = login;