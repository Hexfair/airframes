import { REGEXP } from '../constants/regexp.js';

export function findCallsign(text) {
	const textWithoutSpace = text.replace(/\s/, '');
	const checkReg = textWithoutSpace.match(REGEXP.regexpFullFlight);

	if (checkReg) {
		const arr = checkReg[0].slice(1, -1).split(',');
		return arr[1];
	}

	return '';
}
