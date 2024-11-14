module.exports.config = {
    name: 'autodown',
    version: '1.1.1',
    hasPermssion: 3,
    credits: 'DongDev',
    description: 'Tự động tải xuống khi phát hiện liên kết',
    commandCategory: 'Tiện ích',
    usages: '[]',
    cooldowns: 2,
    images: [],
};

const axios = require('axios');
const fse = require('fs-extra');
const fs = require('fs-extra');
const apidown = require("caliph-api");
const path = __dirname+'/data/autodown.json';
const cheerio = require('cheerio');
const qs = require("qs");
module.exports.onLoad = () => {
    if (!fse.existsSync(path)) {
        fse.writeFileSync(path, '{}');
    }
};

function convertSecondsToHMS(seconds) {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const remainingSeconds = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${hours}:${minutes}:${remainingSeconds}`;
}

async function getYtb(url) {
    function formatSeconds(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  function getRandomUserAgent() {
    const browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];
    const osList = [
      "Windows NT 10.0; Win64; x64",
      "Macintosh; Intel Mac OS X 10_15_7",
      "X11; Linux x86_64",
    ];
    const webKitVersion = `537.${Math.floor(Math.random() * 100)}`;
    const browserVersion = `${Math.floor(Math.random() * 100)}.0.${Math.floor(Math.random() * 10000)}.${Math.floor(Math.random() * 100)}`;
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const os = osList[Math.floor(Math.random() * osList.length)];
    return `Mozilla/5.0 (${os}) AppleWebKit/${webKitVersion} (KHTML, like Gecko) ${browser}/${browserVersion} Safari/${webKitVersion}`;
  }
  function getRandomValue() {
    return Math.floor(Math.random() * 10000000000);
  }
  function getRandomCookie() {
    const ga = `_ga=GA1.1.${getRandomValue()}.${getRandomValue()}`;
    const gaPSRPB96YVC = `_ga_PSRPB96YVC=GS1.1.${getRandomValue()}.2.1.${getRandomValue()}.0.0.0`;
    return `${ga}; ${gaPSRPB96YVC}`;
  }
  const userAgent = getRandomUserAgent();
  const cookies = getRandomCookie();
  async function getDa(url) {
    try {
      const { data } = await axios.post(
        "https://www.y2mate.com/mates/vi854/analyzeV2/ajax",
        qs.stringify({
          k_query: url,
          k_page: "Youtube Downloader",
          hl: "vi",
          q_auto: 0,
        }),
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "vi,en;q=0.9",
            "Content-Length": "104",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Cookie: cookies,
            Origin: "https://www.y2mate.com",
            Priority: "u=1, i",
            Referer: "https://www.y2mate.com/vi854/download-youtube",
            "Sec-Ch-Ua":
              '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent": userAgent,
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      );
      return {
        id: data.vid,
        title: data.title,
        duration: data.t,
        k: data.links.mp4["134"].k,
      };
    } catch (error) {
      console.error("Error posting data:", error);
    }
  }
  let dataPost = await getDa(url);
  try {
    const response = await axios.post("https://www.y2mate.com/mates/convertV2/index",
      qs.stringify({
        vid: dataPost.id,
        k: dataPost.k,
      }),
      {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "vi,en;q=0.9",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: cookies,
          Origin: "https://www.y2mate.com",
          Priority: "u=1, i",
          Referer: "https://www.y2mate.com/vi/",
          "Sec-Ch-Ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent": userAgent,
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    );
    return {
      id: dataPost.id,
      title: dataPost.title,
      duration: formatSeconds(dataPost.duration),
      url: response.data.dlink,
    };
  } catch (error) {
    console.error("Error:", error);
  }
}

async function facebookv2(url) {
	try {
      const headers = {
	"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
	"accept-encoding": "gzip, deflate, br",
	"accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,pl;q=0.6,fr;q=0.5",
	"content-type": "application/x-www-form-urlencoded",
	"cookie": "__cf_bm=3ToPyQw4RFUmm9C4NZ2NCZ_4wQa7m3tNeEoV_R0UKKI-1645178570-0-Ab6cV9ZkfM41eYLCHvvZOLQ6QWm66KQ51FT6svub20gTNKIWiNXGj1FLwM/VmE/3Cbvzr+Wb/7X/tN6JT8H6RFM=; XSRF-TOKEN=eyJpdiI6IlFiVG11RnV4TXJlSVJ2XC9mNjRcL0dLUT09IiwidmFsdWUiOiJpOWhUSGVhNDRzeW52NFwvcTFuRWZteGRWQk01R3RIenZWbVpSMTRMNjUrRkFQWnJCNGJcL1FBem96ZTAxT0k2SGpXaGFlQmVxVUZzTnhxNDJOdlRZSXpRPT0iLCJtYWMiOiJjMzMwMzA1NTI1ZGQzZmViY2NjZTM0YjM1NzZkMDJjNTM1Y2VjYzg1ZDg5MjUwYzBiNjZiNDkxMmY3ZWMyYjlmIn0=; laravel_session=eyJpdiI6Ijd2d1NiRUR0YkZ4R0lTdlwvUm5Dd1ZnPT0iLCJ2YWx1ZSI6IjVveitwanNDUEl3S2IzWXdYTDc5UUt5SkJ6Z0tKSHdFRGkwQUEwa0lNekFOcExlNkVBNE9vemNTdmMyZ2ZneXNqRkxUWmdPVEppd3BHbFZzK010aEFnPT0iLCJtYWMiOiJjMTg1ODkwYTM4M2ZiYjllNzMzMzU2OTMzOWJmN2RhYWU1NmFmOGY3N2ZmMjQzZDQ5ZGU4YjY4ZGVmOTIzMTRhIn0=",
	"origin": "https://www.getfvid.com",
	"referer": "https://www.getfvid.com/",
	"sec-ch-ua": `"Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"`,
	"user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Mobile Safari/537.36"
};     
		const payload = new URLSearchParams();
		payload.append('url', url);
		const response = await axios.post("https://www.getfvid.com/downloader", payload, {
			headers: headers
		});
		const $ = cheerio.load(response.data);
		return {
			title: $('div.page-content div.col-lg-10 div:nth-child(3) div.col-md-5.no-padd h5 a').text().trim(),
			HD: $('div.page-content div.col-lg-10 div:nth-child(3) div.col-md-4.btns-download p:nth-child(1) a').attr('href'),
			SD: $('div.page-content div.col-lg-10 div:nth-child(3) div.col-md-4.btns-download p:nth-child(2) a').attr('href'),
			audio: $('div.page-content div.col-lg-10 div:nth-child(3) div.col-md-4.btns-download p:nth-child(3) a').attr('href')
		};
	} catch (error) {
		console.error("Error:", error);
		return null;
	}
}

async function aiodl(url) {
  try {
    const response = await axios.post("https://aiovd.com/wp-json/aio-dl/video-data", {
      url: url
    }, 
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const res = response.data;
    const result = {
      data: res.medias
    };
    return result;
  } catch (error) {
    console.error("Lỗi khi gọi aiodl:", error);
    throw error;
  }
}

async function strfb(el) {
  const parseString = (string) => {
    try {
      return JSON.parse(`{"text": "${string}"}`).text;
    } catch (error) {
      return "";
    }
  };

  const cookiess = require('./../../acc.json');
  const headers = {
    "sec-fetch-user": "?1",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-site": "none",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "cache-control": "max-age=0",
    authority: "www.facebook.com",
    "upgrade-insecure-requests": "1",
    "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
    "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    cookie: cookiess.cookie,
  };

  try {
    if (!el || !el.trim()) {
      return "Thiếu url facebook";
    }

    if (!el.includes("facebook.com")) {
      return "Vui lòng nhập video facebook hợp lệ!";
    }

    const { data } = await axios.get(el, { headers });
    const formattedData = data.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    const userDataMatch = formattedData.match(/"__isCameraPostBucketOwnerUnion":"User".*?"name":"(.*?)"/);
    const reactionCountMatch = formattedData.match(/"total_reaction_count":(\d+)/);
    const hdMatch = formattedData.match(/"browser_native_hd_url":"(.*?)"/);
    const titleMatch = formattedData.match(/<meta\sname="description"\scontent="(.*?)"/);

    if (hdMatch && hdMatch[1]) {
      const result = {
        title: titleMatch && titleMatch[1] ? parseString(titleMatch[1]) : (data.match(/<title>(.*?)<\/title>/)?.[1] ?? ""),
        link: parseString(hdMatch[1]),
        user: userDataMatch && userDataMatch[1] ? parseString(userDataMatch[1]) : "",
        reactionCount: reactionCountMatch && reactionCountMatch[1] ? parseInt(reactionCountMatch[1]) : 0
      };
      return result;
    } else {
      return "Không thể lấy thông tin video vào thời điểm này. Vui lòng thử lại";
    }
  } catch (error) {
    return "Lỗi khi thực hiện yêu cầu";
  }
};

async function scldown(url) {
    try {
        const response = await axios.post("https://www.klickaud.co/download.php", new URLSearchParams(Object.entries({
            'value': url,
            'afae4540b697beca72538dccafd46ea2ce84bec29b359a83751f62fc662d908a': '2106439ef3318091a603bfb1623e0774a6db38ca6579dae63bcbb57253d2199e'
        })), {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "user-agent": "RizFurr UwU"
            }
        });

        const $ = cheerio.load(response.data);
        const title = $('#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(2)').text();
        const link = $('#dlMP3').attr('onclick').split(`downloadFile('`)[1].split(`',`)[0];

        const result = {
                title: title,
                link: link
        };

        return result;
    } catch (error) {
        throw error;
    }
}

module.exports.handleEvent = async function({ api, event }) {
    const s = JSON.parse(fse.readFileSync(path));
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || DD/MM/YYYY");
    const cookiess = require('./../../acc.json');
    let streamURL = (url, ext = 'jpg') => require('axios').get(url, {
    responseType: 'stream',
}).then(res => (res.data.path = `tmp.${ext}`, res.data)).catch(e => null);
              
    if (event.senderID == (global.botID || api.getCurrentUserID())) return;
    if ((typeof s[event.threadID] == 'boolean' && !s[event.threadID])) return;

    const send = (a, b, c, d) => api.sendMessage(a, b?b: event.threadID, c?c: null, d?d: event.messageID),
    arr = event.args,
    regEx_tiktok = /^https?:\/\/(?:vm\.|vt\.|www\.)?(?:tiktok|douyin)\.com\//,
    regEx_youtube = /(^https:\/\/)((www)\.)?(youtube|youtu)(PP)*\.(com|be)\//,
    regEx_facebook = /(^https:\/\/)(\w+\.)?(facebook|fb)\.(com|watch)\/((story\.php|page\.\w+)(\?|\/))?(story_fbid=|\w+\/)/,
    regEx_stotyfb = /(^https:\/\/)(www\.)?facebook\.com\/stories\/\d+\/[A-Za-z0-9_-]+=/,
    regEx_fbdl = /^https:\/\/(?:www\.)?facebook\.com\/(?:share|reel)\/.*$/i,
    regEx_fbv2 = /^https:\/\/(?:fb\.watch|www\.facebook\.com\/(?:reel|share)\/\d+)(?:\/)?$/,
    regEx_instagram = /^\u0068\u0074\u0074\u0070\u0073\u003a\/\/(www\.)?instagram\.com\/(reel|p)\/\w+\/\w*/,
    regEx_threads = /^https?:\/\/www\.threads\.net\//,
    regEx_capcut = /(^https:\/\/)((www)\.)?(capcut)\.(com)\//,
    regEx_imgur = /(^https:\/\/)((www|i)\.)?(imgur)\.(com)\//,
    regEx_soundcloud = /(https:\/\/(?:www\.|m\.|on\.)?soundcloud\.com\S*)/g,
    regEx_zingmp3 = /(^https:\/\/)((www|mp3)\.)?(zing)\.(vn)\//,
    regEx_spotify = /(^https:\/\/)((www|open|play)\.)?(spotify)\.(com)\//,
    regEx_twitter = /(^https:\/\/)((www|mobile|web)\.)?(twitter|x)\.(com)\//,
    regEx_mediafire = /(^https:\/\/)((www|download)\.)?(mediafire)\.(com)\//,
    regEx_imgbb = /(^https:\/\/)((i)\.)?(ibb)\.(co)\//,
    regEx_filecatbox = /(^https:\/\/)((files)\.)?(catbox)\.(moe)\//,
    regEx_pinterest = /(^https:\/\/)(pin)\.(it)\//

for (const el of arr) {
if (regEx_tiktok.test(el)) {
   const platform = el.includes("tiktok") ? "TIKTOK" : "DOUYIN";
   const data = (await axios.post(`https://www.tikwm.com/api/`, { url: el })).data.data;
   send({body: `[ ${platform} ] - Tự Động Tải\n\n📝 Tiêu Đề: ${data.title}\n❤️ Lượt Thích: ${data.digg_count}\n🔎 Lượt xem: ${data.play_count}\n💬 Lượt Bình Luận: ${data.comment_count}\n🔁 Lượt Chia Sẻ: ${data.share_count}\n⏳ Thời Lượng: ${data.duration} giây\n👤 Tác giả: ${data.author.nickname} (${data.author.unique_id})\n🎵 Âm nhạc: ${data.music_info.author}\n──────────────────\n👉 Thả cảm xúc "😆" nếu muốn tải nhạc`, attachment: (data.images?await Promise.all(data.images.map($=>streamURL($))):await streamURL(data.play, 'mp4')),}, '', (err, dataMsg) => global.client.handleReaction.push({
                    name: this.config.name,
                    messageID: dataMsg.messageID,
                    url: data.music
                }));
        };
        /* END */
if (regEx_facebook.test(el)) {
    const fbdl = require('./../../lib/fbdlpost.js');
    const cookie = cookiess.cookie;
    const url = el;

    fbdl.fbflpost(url, cookie, (error, res) => {
      if (error) {
    } else {
            let vd = res.attachment.filter($ => $.__typename == 'Video');
            let pt = res.attachment.filter($ => $.__typename == 'Photo');

            let s = attachment => send({
                body: `[ FACEBOOK ] - Tự Động Tải\n\n📝 Tiêu đề: ${res.message}\n⏰ Time: ${time}\n\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link` + '',
                attachment,
            }, '', (err, dataMsg) => global.client.handleReaction.push({
                name: this.config.name,
                messageID: dataMsg.messageID,
                url_audio: null
            }));

            Promise.all(vd.map($ => streamURL($.browser_native_sd_url, 'mp4')))
                .then(r => r.filter($ => !!$).length > 0 ? s(r) : '');

            Promise.all(pt.map($ => streamURL(($.image || $.photo_image).uri, 'jpg')))
                .then(r => r.filter($ => !!$).length > 0 ? s(r) : '');
        }
    });
};

if (regEx_youtube.test(el)) {
    const res = await getYtb(el);
          send({body: `[ YOUTUBE ] - Tự Động Tải\n⩺ Tiêu đề: ${res.title}\n⩺ Thời lượng: ${res.duration}`, attachment: await streamURL(res.url, 'mp4')});
};


if (regEx_fbdl.test(el)) {
  const result = await strfb(el);
  const res = result.link;
  send({
    body: `[ FACEBOOK ] - Tự Động Tải\n\n📝 Tiêu đề: ${result.title}\n👤 User: ${result.user}\n🐥 Lượt thả cảm xúc: ${result.reactionCount}\n⏰ Time: ${time}\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`,
    attachment: (await axios.get(res, { responseType: "stream" })).data
    });
};

/*if (regEx_fbv2.test(el)) {
  const url = el;
  const result = await facebookv2(url);
  const res = result.HD;
  const response = await axios.get(res, { responseType: 'stream' });
  send({
    body: `[ FACEBOOK ] - Tự Động Tải\n\n📝 Tiêu đề: ${result.title}\n⏰ Time: ${time}\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`,
    attachment: response.data
    });
};*/

/*if (regEx_fbdl.test(el)) {
  const url = el;
  const result = await aiodl(url);
  send({
    body: `[ FACEBOOK ] - Tự Động Tải\n\n⏰ Time: ${time}\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`,
  attachment: await streamURL(result.data[0].url, 'mp4')
    });
};*/

if (regEx_threads.test(el)) {
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
        'Cookie': '_uafec=Mozilla%2F5.0%20(Linux%3B%20Android%2010%3B%20K)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F120.0.0.0%20Mobile%20Safari%2F537.36;',
        'Accept-Language': 'vi-VN, en-US'
    };

    axios.get(`https://api.threadsphotodownloader.com/v2/media?url=${el}`, { headers })
        .then(async (res) => {
            const data = res.data;

            const attachment = data.image_urls && data.image_urls.length > 0
                ? await Promise.all(data.image_urls.map(url => streamURL(url, 'jpg')))
                : (data.video_urls && data.video_urls.length > 0
                    ? await streamURL(data.video_urls[0].download_url, 'mp4')
                    : null);

            send({
                body: `[ THREADS ] - Tự Động Tải\n\n⏰ Time: ${time}\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`,
                attachment
            });
      });
};

   if (regEx_mediafire.test(el)) {
            const res = (await axios.get(`${global.config.configApi.link[1]}/api/mediafireDL?url=${el}/file&apikey=${global.config.configApi.key[1]}`)).data.result;
            send({body: `[ MEDIAFIRE ] - Tự Động Tải\n\n📝 Title: ${res.title}\n🔁 Kích thước: ${res.size}\n📎 Link download: ${res.link}\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`
        })
      };

  if (regEx_pinterest.test(el)) {
 const res = await axios.get(`https://api.imgbb.com/1/upload?key=588779c93c7187148b4fa9b7e9815da9&image=${el}`);
   send({body: `[ PINTEREST ] - Tự Động Tải\n\n📎 Link ảnh: ${res.data.data.image.url}\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`, attachment: await streamURL(res.data.data.image.url, 'jpg')});
  };

if (regEx_zingmp3.test(el)) {
  const matchResult = el.match(/\/([a-zA-Z0-9]+)\.html/) || el.match(/([a-zA-Z0-9]+)$/);
    const id = matchResult?.[1];
    const response = await axios.get(`http://api.mp3.zing.vn/api/streaming/audio/${id}/128`, {
      responseType: 'stream'
    });
  send({body: `[ ZINGMP3 ] - Tự Động Tải\n\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`,
      attachment: response.data
    });
};

if (regEx_capcut.test(el)) {
    const capcutdl = require('./../../lib/capcut.js');
    const url = el;
    const result = await capcutdl(url);
    const videoURL = result[0].video; 
        send({
          body: `[ CAPCUT ] - Tự Động Tải\n\n📝 Tiêu đề: ${result[0].title}\n😻 Mô tả: ${result[0].description}\n🌸 Lượt dùng: ${result[0].usage}\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`, attachment: await streamURL(videoURL, 'mp4')});
   };
if (regEx_instagram.test(el)) {
  const { download } = require("../../lib/instagram.js");
  const res = await download(el);
            let attachments = [];        
            if (res.attachments && res.attachments.length > 0) {
                for (const at of res.attachments) {
                    if (at.type === 'Video') {
                        attachments.push(await streamURL(at.url, 'mp4'));
                    } else if (at.type === 'Photo') {
                        attachments.push(await streamURL(at.url, 'jpg'));
                    }
                }            
            send({body: `[ INSTAGRAM ] - Tự động tải\n\n⩺ Tiêu đề: ${res.message}\n⩺ Tác giả: ${res.author}\n⩺ Lượt thích: ${res.like}\n⩺ Bình luận: ${res.comment}`, attachment: attachments});
            }
}
if (regEx_soundcloud.test(el)) {
    const url = el;
    const result = await scldown(url);
    send({
      body: `[ SOUNDCLOUD ] - Tự Động Tải\n\n📝 Tiêu đề: ${result.title}\n⏰ Time: ${time}\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`, attachment: await streamURL(result.link, 'mp3')
    });
};

if (regEx_twitter.test(el)) {
    const twdown = require('./../../lib/twdown.js');
    const url = el;
    const options = { text: true };
    const res = await twdown(url, options);

    const mediaUrls = res.media.filter(mediaItem => mediaItem); // Lọc các phần tử không rỗng trong mảng media
    const convertedDate = moment(res.date, "ddd MMM DD HH:mm:ss Z YYYY").format("dddd, DD/MM/YYYY - HH:mm:ss");

    const s = attachment => send({ 
        body: `[ TWITTER ] - Tự Động Tải\n\n📝 Tiêu đề: ${res.title}\n❤️ Lượt thích: ${res.likes}\n💬 Lượt trả lời: ${res.replies}\n🔁 Lượt retweet: ${res.retweets}\n📅 Ngày đăng: ${convertedDate}\n👤 Tác giả: ${res.author} (@${res.username})\n──────────────────\n📺 Đây là tính năng tự động tải khi phát hiện link`, 
        attachment,
    }, '', (err, dataMsg) => global.client.handleReaction.push({
        name: configCommand.name, messageID: dataMsg.messageID, url_audio: null
    }));

    const videoUrls = mediaUrls.filter(mediaItem => res.type === 'video');
    const imageUrls = mediaUrls.filter(mediaItem => res.type === 'image');

    Promise.all(videoUrls.map(url => streamURL(url, 'mp4'))).then(r => r.length > 0 ? s(r) : '');
    Promise.all(imageUrls.map(url => streamURL(url, 'jpg'))).then(r => r.length > 0 ? s(r) : '');
};
   }
};
/* END */
module.exports.handleReaction = async ({ api, event, handleReaction }) => {
  if(event.reaction == '😆'){
    const send = (a, b, c, d) => api.sendMessage(a, b?b: event.threadID, c?c: null, d),
    _ = handleReaction;
    let streamURL = (url, ext = 'jpg') => require('axios').get(url, {
    responseType: 'stream',
}).then(res => (res.data.path = `tmp.${ext}`, res.data)).catch(e => null);
    if ('url'in _) send({
        body: `[ MP3 DOWNLOAD ] - Down mp3 từ video\n\n🎶 Âm thanh từ video mà bạn yêu cầu nè\n✏️ Đây là tính năng tự động down mp3 khi bạn thả cảm xúc ( 😆 ) vào video`, attachment: await streamURL(_.url, 'mp3')}, '', '', _.messageID);
     }
};
module.exports.run = async ({ api, event }) => {
    const send = (a, b, c, d) => api.sendMessage(a, b?b: event.threadID, c?c: null, d?d: event.messageID);
    const data = JSON.parse(fse.readFileSync(path));
    s = data[event.threadID] = typeof data[event.threadID] != 'boolean'||!!data[event.threadID]?false: true;
    fse.writeFileSync(path, JSON.stringify(data, 0, 4));
    send((s?'Bật': 'Tắt')+' '+ this.config.name);
};