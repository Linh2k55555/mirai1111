const axios = require('axios');
const qs = require("qs");
const fs = require("fs");
async function getData(url) {
  try {
    const response = await axios.post("https://aiodl.com/wp-json/aio-dl/video-data/", {
      url: url
    }, 
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const res = response.data;
    function getMediaUrl(medias, extension, quality) {
      for (let media of medias) {
        if (media.extension === extension && media.quality === quality) {
          return media.url;
         }
      }
        return null;
    }
    const mp4Url = getMediaUrl(res.medias, 'mp4', '360p');
    const mp3Url = getMediaUrl(res.medias, 'mp3', '128kbps');
    return {
      title: res.title,
      duration: res.duration,
      video: mp4Url,
      audio: mp3Url
    };
  } catch (error) {
    console.error("Lỗi khi gọi aiodl:", error);
    throw error;
  }
}
this.config = {
    name: 'atdytb',
    version: '1.1.1',
    hasPermssion: 3,
    credits: 'DongDev', // Thay credits làm chó 🐶
    description: 'Tự động tải xuống khi phát hiện liên kết YouTube',
    commandCategory: 'Tiện ích',
    usages: '[]',
    cooldowns: 2
};
function urlify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  return matches || []; 
}
this.handleEvent = async function({ api, event }) {    
try {
    if (event.senderID == api.getCurrentUserID()) return;
    async function streamURL(url, type) {
  return axios.get(url, {
    responseType: 'arraybuffer'
  }).then(res => {
    const path = __dirname + `/cache/${Date.now()}.${type}`;
    fs.writeFileSync(path, res.data);
    setTimeout(p => fs.unlinkSync(p), 1000 * 60, path);
    return fs.createReadStream(path);
  });
}
 const send = (msg, callback) => api.sendMessage(msg, event.threadID, callback, event.messageID);
    const head = app => `[ AUTODOWN - ${app} ]\n────────────────`;
    const urls = urlify(event.body);
    for (const str of urls) {
        if (/(^https:\/\/)((www)\.)?(youtube|youtu)(PP)*\.(com|be)\//.test(str)) {
          const res = await getData(str);
          send({body: `${head('YOUTUBE')}\n⩺ Tiêu đề: ${res.title}\n⩺ Thời lượng: ${res.duration}`, attachment: await streamURL(res.video, 'mp4')});
      }
   }
}catch(e){console.log(e)}
};
this.run=async()=>{};