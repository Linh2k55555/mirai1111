const axios = require('axios');

this.config = {
 name: "girl",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "DC-Nam",
 description: "gái ",
 commandCategory: "Ảnh",
 usages: "",
 cooldowns: 0
};
global.queuesabc = [];
this.stream_url= function (url) {
 return axios({
 url: url,
 responseType: 'stream',
 }).then(_ => _.data);
},
this.onLoad = async function (o) {
 let status = false;
 const api_url = 'https://duongkum999.tech/gai/';
 const urls = ['https://ep.edu.vn/xem-hinh-hot-girl-de-thuong/imager_9_11850_700.jpg'];
 if (!global.mmccffjjs) global.mmccffjjs = setInterval(_ => {
 if (status == true || global.queuesabc.length > 5) return;
 status = true;
 Promise.all([...Array(5)].map(e => axios.get(api_url).then(r => this.upload(r.data.data)))).then(res => (global.queuesabc.push(...res), status = false));
 },1000 * 5);
this.upload = async function (url) {
 const form = {
 upload_1024: await this.stream_url(url),
 };

 return o.api.postFormData('https://upload.facebook.com/ajax/mercury/upload.php',
 form).then(res => Object.entries(JSON.parse(res.body.replace('for (;;);', '')).payload?.metadata?.[0] || {})[0]);
 };
 },
this.run = async function (o) {
 let send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res || err), o.event.messageID));

 send({
 body: 'Video',
 attachment: global.queuesabc.splice(0, 1),
 });
}