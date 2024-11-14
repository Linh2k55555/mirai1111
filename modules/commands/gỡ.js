this.config = {
	name: "gỡ",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "DongDev",
	description: "Gỡ tin nhắn của Bot",
	commandCategory: "Tiện ích",
 usages: "",
 prefix: false,
};
this.run = async ({ api, event }) => {
try {
 event.messageReply?.senderID == api.getCurrentUserID() ? api.unsendMessage(event.messageReply.messageID) : api.sendMessage("Chỉ gỡ được tin nhắn của bot.", event.threadID);
} catch (e) { 
 console.log(e);
 }
}