import { REGEXP } from '../constants/regexp.js';

export function findMission(text) {
	const textWithoutSpace = text.replace(/\s/, '');
	const checkReg = textWithoutSpace.match(REGEXP.regexpMission);

	if (checkReg) {
		return checkReg[0].slice(0, -1);
	}

	return '';
}