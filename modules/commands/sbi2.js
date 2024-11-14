const axios = require("axios");
const qs = require("qs");

module.exports.config = {
    name: "sbi2",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "amen",
    description: "amen",
    commandCategory: "admin",
    usages: "[all|number] [category]?",
    cooldowns: 5,
}

module.exports.run = async function ({ event, api, args }) {
    const { threadID, messageID } = event;

    try {
        const number = args[0] ? parseFloat(args[0]) : 1;
        if (isNaN(number)) {
            return api.sendMessage("Vui lòng nhập số tiền hợp lệ! Ví dụ: 10000", threadID, messageID);
        } else {
            const cate = (args[1] || "VND").replace("JPY", "").toUpperCase(); 

            let data = qs.stringify({
                base: "JPY",
                currency: cate,
                mode: "1week",
            });

            let config = {
                method: "post",
                maxBodyLength: Infinity,
                url: "https://www.remit.co.jp/vi/kaigaisoukin/exchangeratecommission/exchange/", 
                headers: {
                    Accept: "application/json, text/javascript, */*; q=0.01",
                    "Content-Type": "application/x-www-form-urlencoded",
                    Cookie: "lang=vi; qtrans_front_language=vi",
                },
                data: data,
            };

            const getTyGia = await axios.request(config);
            const jsonData = getTyGia.data;

            // In ra dữ liệu nhận được từ API để kiểm tra
            console.log(jsonData);

            if (args[0] === "all") {
                let transfer = "";
                for (let key in jsonData) {
                    transfer += `${jsonData[key].unit}: ${jsonData[key].rate}\n`;
                }
                return api.sendMessage(`Tỷ giá được update vào lúc: ${jsonData["JPYVND"].time}\n${transfer}`, threadID, messageID);
            } else {
                const rate = jsonData[`JPY${cate}`]?.rate;
                const date = jsonData[`JPY${cate}`]?.time;

                // Nếu không tìm thấy loại tiền tệ, in ra các loại tiền hiện có trong jsonData để debug
                if (!rate) {
                    let supportedCurrencies = Object.keys(jsonData).join(", ");
                    return api.sendMessage(
                        `Vui lòng nhập loại tiền hợp lệ! Ví dụ: VND (mặc định VND). Các loại tiền hỗ trợ: ${supportedCurrencies}`,
                        threadID,
                        messageID
                    );
                }

                const transfer = (number * parseFloat(rate)).toLocaleString("en-US", {
                    style: "currency",
                    currency: cate,
                    maximumFractionDigits: 5,
                });
                return api.sendMessage(`Giá Chuyển đổi từ SBI được cập nhật vào lúc ${date}: \n     ${number} = ${transfer}`, threadID, messageID);
            }
        }
    } catch (e) {
        console.error(e);
        return api.sendMessage(`Đã xảy ra lỗi không thể lấy tỷ giá. Chi tiết: ${e.message}`, threadID, messageID);
    }
}
