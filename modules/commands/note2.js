const axios = require('axios');
const fs = require('fs');

module.exports = {
 config: {
 name: 'note2',
 version: '0.0.1',
 hasPermssion: 2,
 credits: 'Thanh Nguyên', // Thay credits làm chó
 description: 'https://paste.rs/:UUID',
 commandCategory: 'Hệ Thống',
 usages: '[]',
 cooldowns: 3,
 },
 run: async function(o) {
 const name = module.exports.config.name;
 const url = o.event?.messageReply?.args?.[0] || o.args[1];
 let path = `${__dirname}/${o.args[0]}`;
 const send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res), o.event.messageID));
 const userID = o.event.senderID;
 const userName = (await o.api.getUserInfo(userID))[userID].name;

 try {
 if (/^https:\/\//.test(url)) {
 return send({
 body: `🔗 Nội dung file sẽ được thay thế bởi ${userName}.\n\nThả cảm xúc để xác nhận.`,
 mentions: [{
 tag: userName,
 id: userID
 }]
 }).then(res => {
 res = {
 ...res,
 name,
 path,
 o,
 url,
 action: 'confirm_replace_content',
 };
 global.client.handleReaction.push(res);
 });
 } else {
 if (!fs.existsSync(path)) return send(`❎ Đường dẫn file không tồn tại.`);

 const fileContent = fs.readFileSync(path, 'utf8');
 const response = await axios.post('https://paste.rs', fileContent, {
 headers: { 'Content-Type': 'text/plain' }
 });
 const pasteUrl = response.data.trim(); // paste.rs trả về URL trực tiếp

 return send({
 body: `Note của ${userName} Đây\n📝 URL: ${pasteUrl}\n────────────────\n📂 Thả cảm xúc để upload code`,
 mentions: [{
 tag: userName,
 id: userID
 }]
 }).then(res => {
 res = {
 ...res,
 name,
 path,
 o,
 url: pasteUrl,
 action: 'confirm_replace_content',
 };
 global.client.handleReaction.push(res);
 });
 }
 } catch (e) {
 console.error(e);
 send(e.toString());
 }
 },
 handleReaction: async function(o) {
 const _ = o.handleReaction;
 const send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res), o.event.messageID));

 try {
 if (o.event.userID != _.o.event.senderID) return;

 switch (_.action) {
 case 'confirm_replace_content': {
 const response = await axios.get(_.url, {
 responseType: 'text'
 });
 const content = response.data;

 fs.writeFileSync(_.path, content);
 send({
 body: `✅ Đã upload code thành công bởi ${o.event.senderID}.`,
 mentions: [{
 tag: (await o.api.getUserInfo(o.event.senderID))[o.event.senderID].name,
 id: o.event.senderID
 }]
 }).then(res => {
 res = {
 ..._,
 ...res,
 };
 global.client.handleReaction.push(res);
 });
 }
 break;
 default:
 break;
 }
 } catch (e) {
 console.error(e);
 send(e.toString());
 }
 }
}