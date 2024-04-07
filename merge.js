import fs from 'fs';
import readXlsxFile from 'read-excel-file/node';
import writeXlsxFile from 'write-excel-file/node';
import { schema } from './constants/schema.js';
import { getParseDate } from './utils/get-date.js';

const result = [];
const parseDate = new Date();
const date = getParseDate(parseDate);


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
						timestamp: new Date(rows[i][0]),
						icao: rows[i][2],
						type: rows[i][3],
						callsign: rows[i][4],
						mission: rows[i][5],
						departure: rows[i][6],
						arrival: rows[i][7],
						text: rows[i][8],
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