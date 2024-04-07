export function getParseDate(parseDate) {
	const dateFull = {
		year: parseDate.getFullYear(),
		month: parseDate.getMonth() + 1 < 10 ? `0${parseDate.getMonth() + 1}` : parseDate.getMonth(),
		day: parseDate.getDate() < 10 ? `0${parseDate.getDate()}` : parseDate.getDate(),
		hours: parseDate.getHours() < 10 ? `0${parseDate.getHours()}` : parseDate.getHours(),
		minutes: parseDate.getMinutes() < 10 ? `0${parseDate.getMinutes()}` : parseDate.getMinutes()
	};

	const date = `${dateFull.year}-${dateFull.month}-${dateFull.day}--${dateFull.hours}.${dateFull.minutes}`;

	return date;
}