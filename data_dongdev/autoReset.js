const moment = require('moment-timezone');
module.exports = function () {
 setInterval(async () => {
 const thoiGianHienTai = moment.tz("Asia/Ho_Chi_MinH");

 const timeRestart = [
 { gio: 0, phut: 30, giay: 0 },
 { gio: 1, phut: 30, giay: 0 },
 { gio: 2, phut: 30, giay: 0 },
 { gio: 3, phut: 30, giay: 0 },
 { gio: 4, phut: 30, giay: 0 },
 { gio: 5, phut: 30, giay: 0 },
 { gio: 6, phut: 30, giay: 0 },
 { gio: 7, phut: 30, giay: 0 },
 { gio: 8, phut: 30, giay: 0 },
 { gio: 9, phut: 30, giay: 0 },
 { gio: 10, phut: 30, giay: 0 },
 { gio: 11, phut: 30, giay: 0 },
 { gio: 12, phut: 30, giay: 0 },
 { gio: 13, phut: 30, giay: 0 },
 { gio: 14, phut: 30, giay: 0 },
 { gio: 15, phut: 30, giay: 0 },
 { gio: 16, phut: 30, giay: 0 },
 { gio: 17, phut: 30, giay: 0 },
 { gio: 18, phut: 30, giay: 0 },
 { gio: 19, phut: 30, giay: 0 },
 { gio: 20, phut: 30, giay: 0 },
 { gio: 21, phut: 30, giay: 0 },
 { gio: 22, phut: 30, giay: 0 },
 { gio: 23, phut: 30, giay: 0 }
 ];

 for (const thoiDiem of timeRestart) {
 if (
 thoiGianHienTai.hour() === thoiDiem.gio &&
 thoiGianHienTai.minute() === thoiDiem.phut &&
 thoiGianHienTai.second() === thoiDiem.giay
 ) {
 process.exit(1);
 }
 }
 }, 1000);
};