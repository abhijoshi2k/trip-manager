let defaultPaymentOptions = [
	'No',
	'Recd, RM Mistry',
	'Recd, Dharmesh',
	'Recd, Ajay',
	'Recd, Nilesh',
	'Recd, Vivek',
	'Recd, Jignesh',
	'Recd, Santosh',
	'Recd, Dayanand'
];

function prepareValidation(options) {
	return SpreadsheetApp.newDataValidation()
		.requireValueInList(options, true)
		.setAllowInvalid(false)
		.build();
}

let validation = prepareValidation(defaultPaymentOptions);
let cancellationValidation = prepareValidation([
	...defaultPaymentOptions,
	'Reverted'
]);

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Sheet object
 * @param {number} lr - Last row number
 */
function setPaymentValidation(sheet, lr, cancellation = false) {
	let rule = validation;
	if (cancellation) {
		rule = cancellationValidation;
	}
	sheet.getRange(2, paymentCol, lr - 1, 1).setDataValidation(rule);
}
