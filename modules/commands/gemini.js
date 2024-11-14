const axios = require('axios');

this.config = {
  name: "gemini",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "DongDev",
  description: "Google Gemini Chat AI",
  commandCategory: "AI",
  usages: "[question]",
  cooldowns: 5,
};

this.run = async function({
  args,
  event,
  api
}) {
  let send = (msg) => api.sendMessage(msg, event.threadID, event.messageID);
  if (args.length === 0 && event.type !== 'message_reply') return send({
    body: "Xin chào! Hãy đặt câu hỏi cho tôi!"
  });
  let query = args.join(' ');
  if (event.type === 'message_reply') query += ` "${event.messageReply.body}"`;
  try {
    const {
      data
    } = await axios.post('http://dongdev.click/api/gemini/chat', {
      q: encodeURIComponent(query)
    }, {
      headers: {
        'x-api-key': 'dongdev_3397f475e1'
      }
    });
    send(data);
  } catch (error) {
    send("Đã xảy ra lỗi khi xử lý yêu cầu của bạn.");
  }
};