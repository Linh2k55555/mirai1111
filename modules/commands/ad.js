module.exports.config = {
	name: "ad",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "DongDev",
	description: "admin bot",
	commandCategory: "Thông tin",
	usages: "Prefix",
	cooldowns: 5,
};
module.exports.run = async ({ api, event, Threads }) => {
	const axios = require("axios");
	const link = [
		"https://i.imgur.com/JP4EAgF.png"
	]; // Publish link video hoặc ảnh
	const img = (await axios.get(link[Math.floor(Math.random() * link.length)], { responseType: "stream" })).data;
	/// Get data Link ảnh hoặc vd bằng axios
	return api.sendMessage({
		body: `=====𝗔𝗗𝗠𝗜𝗡=====
[😊] 𝑻𝒆̂𝒏: Hoàng Linh
[💻]𝑪𝒐𝒏𝒕𝒂𝒄𝒕💻 
[☎] 𝑺𝑫𝑻&𝒁𝒂𝒍𝒐: 0343449417 
[🌐] 𝑭𝒂𝒄𝒆𝒃𝒐𝒐𝒌: 𝐡𝐭𝐭𝐩𝐬://𝐰𝐰𝐰.𝐟𝐚𝐜𝐞𝐛𝐨𝐨𝐤.𝐜𝐨𝐦/hoanglinh2112IT
[✉️] 𝑬𝒎𝒂𝒊𝒍:linh20051221@gmail.com	
------------
✔𝑫𝒐𝒏𝒂𝒕𝒆:
[💳] 𝐌𝐛𝐁𝐚𝐧𝐤: 021122005417	
[💳] 𝐌𝐨𝐌𝐨: 0343449417
---- ----`, attachment: img // Trỏ đường dẫn đã khai báo trước đó
	}, event.threadID, async (err, info) => {
		await new Promise(resolve => setTimeout(resolve, 30 * 1000));
		return api.unsendMessage(info.messageID);
	}, event.messageID);
}