import fs from 'fs';
import readXlsxFile from 'read-excel-file/node';
import writeXlsxFile from 'write-excel-file/node';
import { schema } from './schema.js';

const result = [];
const parseDate = new Date();

const dateFull = {
	year: parseDate.getFullYear(),
	month: parseDate.getMonth() + 1 < 10 ? `0${parseDate.getMonth()}` : parseDate.getMonth(),
	day: parseDate.getDate() + 1 < 10 ? `0${parseDate.getDate()}` : parseDate.getDate(),
	hours: parseDate.getHours() < 10 ? `0${parseDate.getHours()}` : parseDate.getHours(),
	minutes: parseDate.getMinutes() < 10 ? `0${parseDate.getMinutes()}` : parseDate.getMinutes()
}
const date = `${dateFull.year}-${dateFull.month + 1}-${dateFull.day}--${dateFull.hours}.${dateFull.minutes}`;



function merge() {
	fs.readdir('./output', function (err, items) {
		if (items.length === 0) {
			return;
		}

		if (err) {
			console.log(`Ошибка чтения директории "./output"...`, err);
			return;
		};

		for (let item of items) {
			readXlsxFile(`./output/${item}`).then((rows) => {
				for (let i = 1; i < rows.length; i++) {
					const obj = {
						icao: rows[i][2],
						type: rows[i][3],
						text: rows[i][4],
						timestamp: new Date(rows[i][0])
					};
					result.push(obj);
				}
			})
		}

		setTimeout(async () => {
			await writeXlsxFile(result, {
				schema,
				filePath: `./output/output_merge_${date}.xlsx`
			})
		}, 3000)
	})
}

merge();