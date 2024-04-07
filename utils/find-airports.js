import { REGEXP } from '../constants/regexp.js';

export function findAirports(text) {
	const textWithoutSpace = text.replace(/\s/, '');
	const checkReg = textWithoutSpace.match(REGEXP.regexpAirports);

	if (checkReg) {
		return checkReg[0].slice(2, -1).split(',');
	}

	return '';
}
