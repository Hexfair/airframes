import writeXlsxFile from 'write-excel-file/node';
import fs from 'fs';

const regexp1 = /\/ID\w{4,6}/i;
const regexp2 = /[a-zA-Z]{3}\w{6}\d{3}\//i;

const URL = [
	'https://api.airframes.io/messages?limit=300&labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=MDINI',
	'https://api.airframes.io/messages?limit=300&labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=FPN%2FID',
	'https://api.airframes.io/messages?limit=300&labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=INI%2FID',
	'https://api.airframes.io/messages?limit=300&labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=POS%2FID',
	'https://api.airframes.io/messages?limit=300&labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=AMC',
	'https://api.airframes.io/messages?limit=300&labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=OI%2FID',
	'https://api.airframes.io/messages?limit=300&labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=WXR%2FID',
	'https://api.airframes.io/messages?limit=300&labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=FTX%2FID',
	'https://api.airframes.io/messages?limit=300&labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=%2FMR'
];

async function start() {
	const parseDate = new Date();
	console.log('Старт парсера: ', parseDate);

	const dateFull = {
		year: parseDate.getFullYear(),
		month: parseDate.getMonth() + 1 < 10 ? `0${parseDate.getMonth()}` : parseDate.getMonth(),
		day: parseDate.getDate() + 1 < 10 ? `0${parseDate.getDate()}` : parseDate.getDate(),
		hours: parseDate.getHours() < 10 ? `0${parseDate.getHours()}` : parseDate.getHours(),
		minutes: parseDate.getMinutes() < 10 ? `0${parseDate.getMinutes()}` : parseDate.getMinutes()
	}

	const date = `${dateFull.year}-${dateFull.month + 1}-${dateFull.day}--${dateFull.hours}.${dateFull.minutes}`;

	let arr = [];
	let result = [];
	let unique = [];
	let lastDate;

	fs.readFile('./last-date.txt', 'utf8', (err, data) => {
		if (err) {
			console.error('Ошибка чтения файла "date.txt"...', err);
			return;
		};
		lastDate = new Date(data);
	})

	for (let url of URL) {
		try {
			console.log(url);
			const res = await fetch(url);
			const data = await res.json();
			arr = arr.concat(data)
		} catch (error) {
			console.log(error);
		}
	}

	for (let item of arr) {

		const itemDate = new Date(item.timestamp);

		if (!item.text || !item.text.match(regexp1) || !item.text.match(regexp2) || itemDate < lastDate) {
			continue
		}

		const obj = {
			id: item.id,
			icao: item.airframe.icao,
			type: item.airframe.icaoType,
			text: item.text.replace(/\r\n/, ''),
			timestamp: item.timestamp ? new Date(item.timestamp) : ''
		};
		result.push(obj);
	}

	let arr2 = [];

	try {
		const res2 = await fetch('https://api.airframes.io/messages?timeframe=last-week&labels=10,1C,C1&text=-IM');
		arr2 = await res2.json();
	} catch (error) {
		console.log(error);
	}

	for (let item2 of arr2) {

		const itemDate2 = new Date(item2.timestamp);

		if (!item2.text || !item2.text.includes('FPL-') || itemDate2 < lastDate) {
			continue
		}

		const obj = {
			id: item2.id,
			icao: item2.airframe.icao,
			type: item2.airframe.icaoType,
			text: item2.text,
			timestamp: item2.timestamp ? new Date(item2.timestamp) : ''
		};
		result.push(obj);
	}

	for (let i = 0; i < result.length; i++) {
		const isFind = unique.find(obj => obj.text === result[i].text);
		if (isFind) continue;
		unique.push(result[i]);
	}

	const schema = [
		{
			column: 'DATE-Z',
			type: Date,
			format: 'dd/mm/yyyy',
			width: 13,
			align: 'center',
			fontSize: 9,
			value: obj => obj.timestamp,
		},
		{
			column: 'TIME-Z',
			type: Date,
			format: 'hh:mm',
			width: 7,
			align: 'center',
			fontSize: 10,
			value: obj => obj.timestamp
		},
		{
			column: 'ICAO',
			type: String,
			width: 8,
			align: 'center',
			fontSize: 10,
			value: obj => obj.icao
		},
		{
			column: 'TYPE',
			type: String,
			width: 6,
			align: 'center',
			fontSize: 10,
			value: obj => obj.type
		},
		{
			column: 'TEXT',
			type: String,
			width: 120,
			wrap: true,
			fontSize: 10,
			value: obj => obj.text
		},
	]

	await writeXlsxFile(unique, {
		schema,
		filePath: `./output/output_${date}.xlsx`
	})

	fs.writeFile('./last-date.txt', String(parseDate), (err) => {
		if (err) {
			console.error('Произошла ошибка при обновлении файла "date.txt" ...', err);
			return;
		}
	});
	console.log('Завершено!');
}

start();

setInterval(() => {
	start();
}, 3600000)


/*
https://api.airframes.io/messages?labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=MDINI&timeframe=last-week

https://api.airframes.io/messages?labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=FPN%2FID&timeframe=last-week

https://api.airframes.io/messages?labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=INI%2FID&timeframe=last-week

https://api.airframes.io/messages?labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=POS%2FID&timeframe=last-week

https://api.airframes.io/messages?labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=AMC&timeframe=last-week

https://api.airframes.io/messages?labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=OI%2FID&timeframe=last-week

https://api.airframes.io/messages?labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=WXR%2FID&timeframe=last-week

https://api.airframes.io/messages?labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=FTX%2FID&timeframe=last-week

https://api.airframes.io/messages?labels=14,20,22,2S,35,1B,1S,2B,2P,2S,2U,4A,4I,H1&text=%2FMR&timeframe=last-week

https://api.airframes.io/messages?labels=10,1C,C1&text=-IM&timeframe=last-week
*/



/*

	const arrWithStr = arr.map(obj => JSON.stringify(obj));
	const uniqueStr = new Set(arrWithStr);
	const uniqueArr = Array.from(uniqueStr);
	const uniqueRes = uniqueArr.map(obj => JSON.parse(obj))

*/

/*
const regexp1 = /\/ID\w{4,6}\,\w{5,7}\,[a-zA-Z]{3}\w{6}\d{3}\//i;
const regexp2 = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[.]\d{3}Z/i;
const regexp3 = /\/AF[a-zA-Z]{4}[,][a-zA-Z]{4}\//i;

*/