export const schema = [
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
