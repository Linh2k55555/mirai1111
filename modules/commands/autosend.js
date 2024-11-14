const moment = require('moment-timezone');

module.exports.config = {
 name: 'autosend',
 version: '10.02',
 hasPermission: 3,
 credits: 'DongDev',
 description: 'Tự động gửi tin nhắn theo giờ đã cài!',
 commandCategory: 'Hệ Thống',
 usages: '[]',
 cooldowns: 3,
 images: [],
};

const axios = require('axios');
const cheerio = require('cheerio');

async function fetchQuotes() {
    try {
        const { data } = await axios.get('https://voh.com.vn/song-dep/nhung-cau-noi-hay-ve-lich-su-502931.html');
        const $ = cheerio.load(data);
        const quotes = [];
        $('ol li').each((i, elem) => {
            const quoteText = $(elem).clone().children('a').remove().end().text().trim();
        
            if (quoteText.length > 0) {
                quotes.push(quoteText);
            }
        });
        return quotes;
    } catch (error) {
        console.error('Error fetching quotes:', error.message);
        return [];
    }
}
const nam = [
 {
 timer: '18:00:00',
 message: ['\n{textQuote}']
 },
 {
 timer: '06:00:00',
 message: ['Chúc mọi người buổi sáng vui vẻ 😉', 'Chúc mn buổi sáng vv ❤️', 'Buổi sáng đầy năng lượng nha các bạn 😙']
 },
 {
 timer: '10:00:00',
 message: ['Nấu cơm nhớ bật nút nha mọi người 😙']
 },
 {
 timer: '11:00:00',
 message: ['Cả sáng mệt mỏi rùi, nghỉ ngơi nạp năng lượng nào!! 😴']
 },
 {
 timer: '12:00:00',
 message: ['Chúc mọi người buổi trưa vui vẻ 😋', 'Chúc mọi người bữa trưa ngon miệng 😋']
 },
 {
 timer: '13:00:00',
 message: ['Chúc mọi người buổi chiều đầy năng lượng 😼', 'Chúc mọi người buổi chiều vui vẻ 🙌']
 },
 {
 timer: '17:00:00',
 message: ['Nhắc nhở các bạn trẻ:\n\nThượng tôn Hiến pháp và pháp luật, tạo động lực đưa đất nước bước vào kỳ nguyên vươn mình của dân tộc.']
 },
 {
 timer: '00:30:00',
 message: ['Chúc mọi người ngủ ngon 😴', 'Khuya rùi ngủ ngon nhé các bạn 😇']
 }
];

module.exports.onLoad = o => setInterval(async () => {
 const r = a => a[Math.floor(Math.random() * a.length)];
 const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');
 let quote = await fetchQuotes();
 var textQuote = `📌 Nhắc nhở các bạn trẻ:\n\n${r(quote)}`;
 if (á = nam.find(i => i.timer === currentTime)) {
 const gio = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || DD/MM/YYYY');
 var msg = r(á.message);
 msg = msg.replace(/{textQuote}/, textQuote);
 msg = {
 body: msg,
 };
 global.data.allThreadID.forEach(i => o.api.sendMessage(msg, i));
 }
}, 1000);
module.exports.run = () => {};