module.exports.config = {
	name: "reset",
	version: "1.0.2",
	hasPermssion: 3,
	credits: "Khánh Milo",
	description: "Khởi động lại bot",
	commandCategory: "admin",
	cooldowns: 5,
	dependencies: {
		"eval": ""
	}
};
module.exports.run = async ({ api, event, args, client, utils }) => {
	const eval = require("eval");
	return api.sendMessage("[⚜️] Thông báo [⚜️]\n[🔰𝙍𝙀𝙎𝙀𝙏🔰] Đang khởi động lại bot...!", event.threadID, () => eval("module.exports = process.exit(1)", true), event.messageID);

}
