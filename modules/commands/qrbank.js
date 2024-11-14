const { QRBank, BankData } = require('qrbank');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "qrbank",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Lofi Team (Satoru)",
    description: "Tạo mã QR để chuyển khoản ngân hàng",
    commandCategory: "banking",
    usages: "[bankCode] [bankNumber] [accountName] [amount] [purpose]",
    cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, body } = event;
    if (body.toLowerCase() === "bankinfo") {
        const bankList = Object.keys(BankData).join(", ");
        return api.sendMessage(`Danh sách mã ngân hàng:\n${bankList}`, threadID, messageID);
    }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, body } = event;
    const { step, data } = handleReply;

    const prompts = [
        "Vui lòng nhập mã ngân hàng:",
        "Vui lòng nhập số tài khoản:",
        "Vui lòng nhập tên tài khoản:",
        "Vui lòng nhập số tiền:",
        "Vui lòng nhập nội dung chuyển khoản:"
    ];

    data[`step${step}`] = body.trim();

    if (step < 5) {
        return api.sendMessage(prompts[step], threadID, (err, info) => {
            global.client.handleReply.push({
                step: step + 1,
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                data
            });
        });
    }

    const { step1: bankCode, step2: bankNumber, step3: accountName, step4: amount, step5: purpose } = data;
    const bankData = BankData[bankCode.toLowerCase()];

    if (!bankData) {
        return api.sendMessage(`Mã ngân hàng "${bankCode}" không hợp lệ!`, threadID, messageID);
    }

    try {
        const qrbank = QRBank.initQRBank({
            bankBin: bankData.bin,
            bankNumber,
            accountName,
            amount,
            purpose
        });

        const qrCode = await qrbank.generateQRCode();
        const canvas = createCanvas(300, 300);
        const ctx = canvas.getContext('2d');
        const img = await loadImage(qrCode);
        ctx.drawImage(img, 0, 0, 300, 300);

        const buffer = canvas.toBuffer('image/png');
        const filename = `qrbank_${Date.now()}.png`;
        const filepath = path.join(__dirname, filename);
        fs.writeFileSync(filepath, buffer);

        api.sendMessage({
            body: `Mã QR chuyển khoản ngân hàng ${bankData.name}:\nSố tài khoản: ${bankNumber}\nTên tài khoản: ${accountName}\nSố tiền: ${amount} VND\nNội dung: ${purpose}`,
            attachment: fs.createReadStream(filepath)
        }, threadID, () => fs.unlinkSync(filepath), messageID);
    } catch (error) {
        console.error(error);
        return api.sendMessage('Đã xảy ra lỗi khi tạo mã QR ngân hàng!', threadID, messageID);
    }
};

module.exports.run = async function ({ api, event }) {
    return api.sendMessage("Vui lòng nhập mã ngân hàng:", event.threadID, (err, info) => {
        global.client.handleReply.push({
            step: 1,
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            data: {}
        });
    });
};