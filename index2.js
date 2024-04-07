import writeXlsxFile from 'write-excel-file/node';
import fs from 'fs';
import { schema } from './constants/schema.js';
import { getParseDate } from './utils/get-date.js';
import { findMission } from './utils/find-mission.js';
import { findAirports } from './utils/find-airports.js';
import { findCallsign } from './utils/find-callsign.js';
import { URL } from './constants/url.js';
import { REGEXP } from './constants/regexp.js';

import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';


const TIMEOUT = 1000 * 60 * 60;

async function start() {
	const agent = new HttpsProxyAgent('http://antonio:12345678@10.104.0.2:8080');
	const parseDate = new Date();
	console.log('Старт парсера: ', parseDate.toLocaleString());
	const date = getParseDate(parseDate);

	let arr = [];
	let arr2 = [];
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
			const res = await fetch(url, { agent });
			const data = await res.json();
			arr = arr.concat(data);

			for (let item of arr) {

				const itemDate = new Date(item.timestamp);

				if (!item.text || !item.text.match(REGEXP.regexpID) || !item.text.match(REGEXP.regexpMission) || itemDate < lastDate) {
					continue
				}

				const obj = {
					id: item.id,
					icao: item.airframe.icao,
					type: item.airframe.icaoType,
					text: item.text.replace(/\r\n/, ''),
					timestamp: item.timestamp ? new Date(item.timestamp) : '',
					mission: findMission(item.text.replace(/\r\n/, '')),
					departure: findAirports(item.text.replace(/\r\n/, ''))[0],
					arrival: findAirports(item.text.replace(/\r\n/, ''))[1],
					callsign: findCallsign(item.text.replace(/\r\n/, ''))
				};
				result.push(obj);
			}
			await sleep(15000);
		} catch (error) {
			console.log(error);
		}
	}

	try {
		console.log('https://api.airframes.io/messages?limit=300&labels=10,1C,C1&text=-IM');
		const res2 = await fetch('https://api.airframes.io/messages?limit=300&labels=10,1C,C1&text=-IM', { agent });
		arr2 = await res2.json();

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
				timestamp: item2.timestamp ? new Date(item2.timestamp) : '',
				mission: '',
				departure: '',
				arrival: '',
				callsign: ''
			};
			result.push(obj);
		}
	} catch (error) {
		console.log(error);
	}

	for (let i = 0; i < result.length; i++) {
		const isFind = unique.find(obj => obj.text === result[i].text);
		if (isFind) continue;
		unique.push(result[i]);
	}

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

async function sleep(ms = 0) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

setInterval(() => {
	start();
}, TIMEOUT)
