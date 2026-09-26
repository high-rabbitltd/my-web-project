const { getHolidays } = require('korean-holidays');
const KoreanLunarCalendar = require('korean-lunar-calendar');

const holidays = getHolidays(2026);
console.log("Holidays 2026:", holidays.slice(0, 3).map(h => ({
  name: h.nameKo,
  dateStr: new Date(h.date.getTime() + 9*60*60*1000).toISOString().split('T')[0]
})));

const lunar = new KoreanLunarCalendar();
lunar.setSolarDate(2026, 9, 25);
const lunarInfo = lunar.getLunarCalendar();
console.log("Lunar:", lunarInfo.month, lunarInfo.day);
