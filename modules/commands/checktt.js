const p = require("path");
const fs = require("fs");
const moment = require('moment-timezone');

moment.locale('vi');

const cacheDir = p.join(__dirname, 'cache', 'checktts');

if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}
const fileNoti = cacheDir + '/notiData.json'
if (!fs.existsSync(fileNoti)) {
    fs.writeFileSync(fileNoti, JSON.stringify([]));
}
let resets = false;

const createNewFile = (filePath, event) => {
    const New_File = {
        Time: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || YYYY-MM-DD'),
        total: [],
        week: [],
        day: []
    };

    if (event.isGroup) {
        const listID = event.participantIDs;
        for (let userID of listID) {
            const userTemplate = {
                id: userID,
                count: 0,
                ttgn: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || dddd'),
                joinTime: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || YYYY-MM-DD')
            };
            New_File.total.push(userTemplate);
            New_File.week.push(userTemplate);
            New_File.day.push(userTemplate);
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(New_File, null, 4));
    return New_File;
};


const join_time = (joinTime) => {
    const [t, dp] = joinTime.split(' || ');
    const j = moment.tz(`${dp}T${t}`, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Ho_Chi_Minh');
    const now = moment.tz('Asia/Ho_Chi_Minh');
    const dt = moment.duration(now.diff(j));
    const d = dt.asDays();
    const h = dt.hours();
    const m = dt.minutes();
    const s = dt.seconds();

    if (d >= 1) {
        return `${Math.floor(d)} ngày`;
    } else {
        return `${h}|${m}|${s}`;
    }
};
module.exports = {
    config: {
        name: "checktt",
        version: "3.0.0",
        credits: "Niio-team (Vtuan)",
        Rent: 1,
        hasPermssion: 0,
        description: "no",
        usage: "no",
        commandCategory: "Nhóm",
        cooldowns: 0
    },
    handleEvent: async function ({ api, event, Threads }) {
        if (resets) return;
        if (!event.isGroup) return;

        const { senderID, threadID } = event;
        const filePath = p.join(cacheDir, `${threadID}.json`);

        let threadData;
        if (!fs.existsSync(filePath)) {
            threadData = createNewFile(filePath, event);
        } else {
            try {
                const rawData = fs.readFileSync(filePath);
                threadData = JSON.parse(rawData);
            } catch (error) {
                threadData = createNewFile(filePath, event);
            }

            if (event.isGroup) {
                for (let userID of event.participantIDs) {
                    if (!threadData.total.some(user => user.id == userID)) {
                        const userTemplate = {
                            id: userID,
                            count: 0,
                            ttgn: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || dddd'),
                            joinTime: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || YYYY-MM-DD')
                        };
                        threadData.total.push(userTemplate);
                        threadData.week.push(userTemplate);
                        threadData.day.push(userTemplate);
                    }
                }
                fs.writeFileSync(filePath, JSON.stringify(threadData, null, 4));
            }
        }

        const updateData = (dataArray, senderID) => {
            const userDataIndex = dataArray.findIndex(e => e.id == senderID);

            if (userDataIndex === -1) {
                dataArray.push({
                    id: senderID,
                    count: 1,
                    ttgn: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || dddd'),
                    joinTime: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || YYYY-MM-DD')
                });
            } else {
                dataArray[userDataIndex].count++;
                dataArray[userDataIndex].ttgn = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || dddd');
            }
        };

        updateData(threadData.total, senderID);
        updateData(threadData.week, senderID);
        updateData(threadData.day, senderID);

        fs.writeFileSync(filePath, JSON.stringify(threadData, null, 4));
    },
    run: async function ({ api, event, Threads, args, Users }) {
        const { messageReply, mentions, threadID, messageID, senderID } = event;
        const filePath = p.join(cacheDir, `${threadID}.json`);
        const threadData = JSON.parse(fs.readFileSync(filePath));

        function quickSort(arr, key) {
            if (arr.length <= 1) return arr;
            const pivot = arr[Math.floor(arr.length / 2)][key];
            const left = arr.filter(item => item[key] > pivot);
            const middle = arr.filter(item => item[key] === pivot);
            const right = arr.filter(item => item[key] < pivot);
            return [...quickSort(left, key), ...middle, ...quickSort(right, key)];
        }

        const checkTypes = {
            all: 'total',
            day: 'day',
            week: 'week'
        };

        const type = checkTypes[args[0]];

        if (type) {
            const datas = threadData[type].filter(user => event.participantIDs.includes(user.id));
            const sortedData = await quickSort(datas, 'count');

            let message = `== [ CHECKTT ${args[0].toUpperCase()} ] ==`;
            for (const [index, user] of sortedData.entries()) {
                const userInfo = await Users.getData(user.id);

                let userName = userInfo.name;
                if (!userName) {
                    const userInfoApi = await api.getUserInfo(user.id);
                    userName = userInfoApi[user.id]?.name || "Unknown";
                }
                message += `\n${index + 1}. ${userName}: ${user.count}`;
            }

            if (type !== 'day') {
                message += `\n\n⚠️ Reply tin nhắn này kèm\n📌 Lọc + số tin nhắn: bot sẽ lọc những người có số tin nhắn từ số tin nhắn mà người dùng nhập vào` +
                    `\n📛 Kick + stt (có thể nhập nhiều, cách nhau bằng dấu cách): bot sẽ kick người đó khỏi nhóm` +
                    `\n📎 Tag: để tag những thành viên không tương tác trong ngày lên(tin nhắn = 0)!` +
                    `\n🔄 Reset: để reset tin nhắn về 0` +
                    `\n\n⏱️ Gỡ tự động sau 60s`;
            }

            const c = type !== 'day' ? (err, info) => {
                if (err) return console.error(err);
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    author: senderID,
                    messageID: info.messageID,
                    threadID: threadID,
                    sortedData
                });
                setTimeout(() => { api.unsendMessage(info.messageID); }, 60000);
            } : null;

            api.sendMessage(message, threadID, c);

            threadData[type] = datas;
            fs.writeFileSync(filePath, JSON.stringify(threadData, null, 4));
        } else if (args[0] === 'reset') {
            const dataThread = (await Threads.getData(event.threadID)).threadInfo;
            if (!dataThread.adminIDs.some(item => item.id === senderID)) {
                return api.sendMessage('⚠️ Bạn không đủ quyền hạn để sử dụng!', threadID, messageID);
            }

            resets = true;
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const participantIDs = event.participantIDs;

                const resetCount = (items) => {
                    return items.filter(item => participantIDs.includes(item.id)).map(item => {
                        item.count = 0;
                        return item;
                    });
                };

                data.total = resetCount(data.total);
                data.week = resetCount(data.week);
                data.day = resetCount(data.day);

                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

                api.sendMessage(`✅ Đã đặt lại toàn bộ dữ liệu đếm tương tác của nhóm`, threadID);
            } catch (error) {
                api.sendMessage(`❎ Lỗi: Không thể đặt lại dữ liệu. ${error.message}`, threadID);
            }
            resets = false;
        } else if (args[0] == 'name') {
            const threadInfo = await Threads.getInfo(threadID);
            const participants = threadInfo.participantIDs.filter(userID => !threadInfo.nicknames[userID])
                .map((userID, index) => ({ id: userID, index }));

            if (participants.length === 0) {
                return api.sendMessage("Tất cả các thành viên đều đã có biệt danh.", threadID, messageID);
            }
            let message = "📋 Danh sách các thành viên chưa có biệt danh:\n";
            for (let i = 0; i < participants.length; i++) {
                const userID = participants[i].id;
                const userInfo = await Users.getData(userID);
                message += `${i + 1}. ${userInfo.name || 'Không xác định'}\n`;
            }
            return api.sendMessage(message, threadID);
        } else if (args[0] == 'lọc') {
            const dataThread = (await Threads.getData(event.threadID)).threadInfo;
            if (!dataThread.adminIDs.some(item => item.id === senderID)) {
                return api.sendMessage('Bạn không đủ quyền hạn để sử dụng!', threadID, messageID);
            }
            const botID = api.getCurrentUserID();
            const botIsAdmin = dataThread.adminIDs.some(admin => admin.id === botID);

            if (!botIsAdmin) {
                return api.sendMessage("⚠️ Bot cần quyền quản trị viên để thực hiện lệnh này.", threadID, messageID);
            }

            const sl = parseInt(args[1]);
            if (isNaN(sl)) {
                return api.sendMessage("Vui lòng nhập một số hợp lệ.", threadID, messageID);
            }

            const userss = threadData.total.filter(user => user.count <= sl).map(user => user.id);

            if (userss.length === 0) {
                return api.sendMessage("❎ Không có thành viên nào có số tin nhắn nhỏ hơn hoặc bằng " + sl, threadID, messageID);
            }
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            for (const id of userss) {
                await api.removeUserFromGroup(id, threadID);
                await delay(500);
            }

            api.sendMessage(`✅ Đã lọc thành công ${userss.length}`, threadID);
        } else if (args[0] == 'die') {

            const dataThread = (await Threads.getData(event.threadID)).threadInfo;
            if (!dataThread.adminIDs.some(item => item.id === senderID)) return api.sendMessage('Quyền hạn????', threadID, messageID);

            var { userInfo, adminIDs } = await api.getThreadInfo(event.threadID);
            var arr = [];

            for (const e of userInfo) {
                if (!e.gender) {
                    arr.push(e.id);
                }
            };

            adminIDs = adminIDs.map(e => e.id).some(e => e == api.getCurrentUserID());
            if (arr.length == 0) {
                return api.sendMessage("Trong nhóm bạn không tồn tại 'Người dùng Facebook'.", event.threadID);
            }
            else {
                api.sendMessage("🔎 Nhóm bạn hiện có " + arr.length + " 'Người dùng Facebook'.\n Thả cảm xúc 👍 vào tin nhắn này để xóa list mem die", event.threadID, (err, info) => {
                    if (err) return console.error(err);
                    global.client.handleReaction.push({
                        name: module.exports.config.name,
                        author: senderID,
                        messageID: info.messageID,
                        threadID: threadID,
                        type: 'checkDie',
                        arr
                    });
                })
            }
        } else if (args[0] == 'tag') {
            const userss = threadData.day.filter(user => user.count === 0).map(user => user.id);

            if (userss.length === 0) {
                return api.sendMessage("Nhóm của bạn tương tác tốt!", threadID, messageID);
            } else {
                const mentions = userss.map(id => ({ id, tag: id }));

                const message = {
                    body: `🗣️🔥 Anh ở vùng quê khu nghèo khó đó Có trăm điều khó Muốn lên thành phố nên phải cố Sao cho bụng anh luôn no Thế rồi gặp em Những vụn vỡ đã lỡ đêm lại nhớ Nằm mơ gọi tên em\n Lên tương tác đi ${userss} con giời!!`,
                    mentions: mentions
                };

                api.sendMessage(message, threadID);
                return;
            }
        } else if (args[0] === 'noti') {
            const notiDatas = JSON.parse(fs.readFileSync(fileNoti));
            let threadIndex = notiDatas.findIndex(e => e.threadID === threadID);
            let thread = notiDatas[threadIndex];
            const timePattern = /^\d{2}:\d{2}:\d{2}$/;

            if (!args[1]) {
                if (thread) {
                    api.sendMessage(`📋 Trạng thái của nhóm:\n⏰ Thời gian: ${thread.time}\nMode1: ${thread.mode1}\nMode2: ${thread.mode2}`, threadID);
                } else {
                    api.sendMessage("❎ Chưa có thông tin thông báo cho nhóm này.\n⚠️ Dùng check noti (nhập theo định dạng HH:MM:SS) ví dụ: check noti 00:00:00 để cài đặt time!!", threadID);
                }
                return;
            }

            if (args[1] === 'on') {
                if (thread) {
                    thread.mode1 = true;
                    thread.mode2 = true;
                } else {
                    return api.sendMessage("Chưa set time", threadID);
                }
                api.sendMessage("✅ Đã cài đặt lại time gửi noti", threadID);
            } else if (args[1] === 'off') {
                if (thread) {
                    thread.mode1 = false;
                    thread.mode2 = false;
                } else {
                    thread = { threadID: threadID, time: '00:00:00', mode1: false, mode2: false };
                    notiDatas.push(thread);
                }
                api.sendMessage("✅ Đã tắt chế độ noti", threadID);
            } else if (args[1] === 'clear') {
                if (threadIndex !== -1) {
                    notiDatas.splice(threadIndex, 1);
                    fs.writeFileSync(fileNoti, JSON.stringify(notiDatas, null, 4), 'utf-8');
                    api.sendMessage("✅ Đã xóa thông tin thông báo của nhóm thành công!", threadID);
                } else {
                    api.sendMessage("Không có thông tin thông báo của nhóm để xóa.", threadID);
                }
            } else if (timePattern.test(args[1])) {
                if (thread) {
                    thread.time = args[1];
                    thread.mode1 = thread.mode2;
                } else {
                    thread = { threadID: threadID, time: args[1], mode1: true, mode2: true };
                    notiDatas.push(thread);
                }
                api.sendMessage("✅ Đã đặt lại thời gian thông báo thành công cho nhóm!", threadID);
            } else {
                api.sendMessage("Thời gian không hợp lệ. Vui lòng nhập theo định dạng HH:MM:SS hoặc sử dụng 'on'/'off'.", threadID);
                return;
            }

            fs.writeFileSync(fileNoti, JSON.stringify(notiDatas, null, 4), 'utf-8');
        } else if (args[0] == 'help') {
            api.sendMessage(`[CHECK HELP]
1. check day/week/all: Xem tất cả tương tác trong ngày/tuần/tổng.
2. check name: Xem tất cả thành viên chưa đặt biệt danh.
3. check lọc + số tin nhắn: Lọc những thành viên có số tin nhắn ít hơn số đã chỉ định.
4. check die: Kiểm tra những tài khoản Facebook đã bị vô hiệu hóa.
5. check tag: Tag tất cả thành viên ít tương tác trong ngày.
6. check noti + giờ:phút:giây/on/off/clear: Đặt thời gian gửi thông báo tương tác cuối ngày/bật/tắt/xóa chế độ tự động gửi thông báo.
7. check reset: Đặt lại dữ liệu tương tác của nhóm về 0.`, threadID, event.messageID);
        } else {
    const uid = messageReply?.senderID || (mentions && Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID);

    const sortedData = quickSort(threadData.total, 'count');
    const sortedData1 = quickSort(threadData.week, 'count');
    const sortedData2 = quickSort(threadData.day, 'count');

    const userIndex = sortedData.findIndex(user => user.id == uid);
    const userIndex1 = sortedData1.findIndex(user => user.id == uid);
    const userIndex2 = sortedData2.findIndex(user => user.id == uid);

    if (userIndex !== -1) {
		        const UID = event.messageReply ? event.messageReply.senderID : Object.keys(mentions)[0] ? Object.keys(mentions)[0] : senderID;

        const userCount = sortedData[userIndex].count;
        const userCount1 = sortedData1[userIndex1]?.count || 0; // Số tin nhắn trong tuần
        const userCount2 = sortedData2[userIndex2]?.count || 0; // Số tin nhắn trong ngày

        const rank = userIndex + 1; // Xếp hạng tổng
        const rank1 = userIndex1 + 1; // Xếp hạng tuần
        const rank2 = userIndex2 + 1; // Xếp hạng ngày
		
        const userTotalDay = threadData.day.find(e => e.id == UID) ? threadData.day.find(e => e.id == UID).count : 0;
        const userTotalWeek = threadData.week.find(e => e.id == UID) ? threadData.week.find(e => e.id == UID).count : 0;
        const userTotal = threadData.total.find(e => e.id == UID) ? threadData.total.find(e => e.id == UID).count : 0;		

        const ttgn = sortedData[userIndex].ttgn;
        const joinTime = sortedData[userIndex].joinTime;

        const userName = (await Users.getData(uid)).name;

        const threadInfo = (await Threads.getData(event.threadID)).threadInfo;
        let permission;

        if (global.config.NDH.includes(uid)) {
            permission = `Người điều hành`;
        } else if (global.config.ADMINBOT.includes(uid)) {
            permission = `Admin bot`;
        } else if (threadInfo.adminIDs.some(i => i.id == uid)) {
            permission = `Quản Trị Viên`;
        } else {
            permission = `Thành viên`;
        }

        const totalCount = sortedData.reduce((sum, user) => sum + user.count, 0);
        const tl = Math.ceil((userCount / totalCount) * 100);

        const joins = join_time(joinTime);

        const message = `✨ Tương tác của ${userName}:\n` +
            `🪪 Chức Vụ: ${permission}\n` +
            `💬 Tổng số tin nhắn: ${userTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n` +
            `📅 Số tin nhắn trong tuần: ${userTotalWeek.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n` +
            `📆 Số tin nhắn trong ngày: ${userTotalDay.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n` +
            `⏰ Lần cuối nhắn tin: ${ttgn}\n` +
            `📊 Tỉ lệ tương tác: ${tl}%\n` +
            `🏆 Xếp hạng: ${rank}/${event.participantIDs.length} (tổng)\n` +
            `🏅 Xếp hạng: ${rank1}/${event.participantIDs.length} (tuần)\n` +
            `🥇 Xếp hạng: ${rank2}/${event.participantIDs.length} (ngày)\n` +
            `📝 Ngày vào nhóm: ${joinTime}\n` +
            `🗓️ Đã tham gia được: ${joins}`;

        api.sendMessage(message, threadID, event.messageID);
    } else {
        api.sendMessage(`User ID: ${uid} không tìm thấy.`, threadID);
            }
        }
    }
};

module.exports.handleReply = async ({ api, event, handleReply, Users, Threads }) => {
    const { body, threadID, messageID, senderID } = event;
    //console.log(event)

    const dataThread = (await Threads.getData(event.threadID)).threadInfo;
    if (!dataThread.adminIDs.some(item => item.id === senderID)) return api.sendMessage('⚠️ Quyền hạn????', threadID, messageID);

    const args = body.trim().split(' ');

    const keyword = args[0].trim().toLowerCase();
    const values = args.slice(1).map(value => parseInt(value, 10));

    const filePath = p.join(cacheDir, `${threadID}.json`);
    const threadData = JSON.parse(fs.readFileSync(filePath));


    if (keyword === 'lọc') {

        const botID = api.getCurrentUserID();
        const botIsAdmin = dataThread.adminIDs.some(admin => admin.id === botID);

        if (!botIsAdmin) return api.sendMessage("⚠️ Bot cần quyền quản trị viên để thực hiện lệnh này.", threadID, messageID);



        const sl = parseInt(values[0], 10);

        if (isNaN(sl)) return api.sendMessage("⚠️ Thiếu số", threadID, messageID);


        const userss = threadData.total.filter(user => user.count <= sl).map(user => user.id);

        if (userss.length === 0) return api.sendMessage("❎ Không có thành viên nào có số tin nhắn nhỏ hơn hoặc bằng " + sl, threadID, messageID);
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for (const id of userss) {
            if (id == botID) continue;
            await api.removeUserFromGroup(id, threadID);
            await delay(500);
        }

        api.sendMessage(`Đã lọc thành công ${userss.length}`, threadID);

    } else if (keyword === 'kick') {
        const botID = api.getCurrentUserID();
        const botIsAdmin = dataThread.adminIDs.some(admin => admin.id === botID);

        if (!botIsAdmin) return api.sendMessage("⚠️ Bot cần quyền quản trị viên để thực hiện lệnh này.", threadID, messageID);


        if (values.length === 0) return api.sendMessage("⚠️ Thiếu số", threadID, messageID);

        if (!values.every(value => /^\d+$/.test(value))) return api.sendMessage(`Nhập số?`, threadID, messageID);

        const listDel = values.map(value => parseInt(value, 10));

        const Thằng_Bị_kick_list = handleReply.sortedData;

        let Thằng_Ngu_Bị_Kick = [];
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for (const [index, user] of Thằng_Bị_kick_list.entries()) {
            if (listDel.includes(index + 1)) {
                try {
                    const userInfo = await Users.getData(user.id);
                    const userName = userInfo.name;
                    if (user.id == botID) continue;
                    await api.removeUserFromGroup(user.id, threadID);
                    Thằng_Ngu_Bị_Kick.push(`${userName}`);
                    await delay(500)
                } catch (error) {
                    //console.error(`Lỗi ${user.id}: ${error.message}`);
                }
            }
        }
        if (Thằng_Ngu_Bị_Kick.length > 0) {
            const message = `Đã kick ${Thằng_Ngu_Bị_Kick.join(', ')}`;
            api.sendMessage(message, threadID);
        }
    } else if (keyword === 'reset') {
        resets = true;
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const participantIDs = event.participantIDs;

            const resetCount = (items) => {
                return items.filter(item => participantIDs.includes(item.id)).map(item => {
                    item.count = 0;
                    return item;
                });
            };

            data.total = resetCount(data.total);
            data.week = resetCount(data.week);
            data.day = resetCount(data.day);

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

            api.sendMessage(`✅ Đã đặt lại toàn bộ dữ liệu đếm tương tác của nhóm`, threadID);
        } catch (error) {
            api.sendMessage(`❎ Lỗi: Không thể đặt lại dữ liệu. ${error.message}`, threadID);
        }
        resets = false;
    } else if (keyword == 'tag') {
        const userss = threadData.day.filter(user => user.count === 0).map(user => user.id);

        if (userss.length === 0) {
            return api.sendMessage("🎉 Chúc mừng\n🏆 Nhóm của bạn tương tác tốt!", threadID, messageID);
        } else {
            const mentions = userss.map(id => ({ id, tag: id }));

            const message = {
                body: `🗣️🔥 Anh ở vùng quê khu nghèo khó đó Có trăm điều khó Muốn lên thành phố nên phải cố Sao cho bụng anh luôn no Thế rồi gặp em Những vụn vỡ đã lỡ đêm lại nhớ Nằm mơ gọi tên em\n Lên tương tác đi ${userss} con giời!!`,
                mentions: mentions
            };

            api.sendMessage(message, threadID);
            return;
        }
    }
};

module.exports.handleReaction = async function ({ api, event, Threads, handleReaction, Users }) {
    const { body, threadID, messageID, userID } = event;

    console.log(event)

    const dataThread = (await Threads.getData(event.threadID)).threadInfo;
    if (!dataThread.adminIDs.some(item => item.id === userID)) return api.sendMessage('⚠️ Quyền hạn????', threadID);
    if (handleReaction.type == "checkDie") {
        const botID = api.getCurrentUserID();
        const botIsAdmin = dataThread.adminIDs.some(admin => admin.id === botID);

        if (!botIsAdmin) return api.sendMessage("⚠️ Bot cần quyền quản trị viên để thực hiện lệnh này.", threadID);
        api.sendMessage("🔄 Bắt đầu lọc..", event.threadID, async function () {
            for (const e of handleReaction.arr) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await api.removeUserFromGroup(parseInt(e), event.threadID);
                    success++;
                }
                catch {
                    fail++;
                }
            }

            api.sendMessage("✅ Đã lọc thành công " + success + " người.", event.threadID, function () {
                if (fail != 0) return api.sendMessage("❎ Lọc thất bại " + fail + " người.", event.threadID);
            });
        })
    }
}