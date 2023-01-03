let maxActive = 150;

/**
 * @param {Object} e - Event object
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet object
 */
const registration = (e, ss) => {
	try {
		let sheet = ss.getSheetByName('Active');

		let lr = sheet.getLastRow();

		for (let i = 2; i <= lr; i++) {
			if (sheet.getRange(i, 5).getValue() === e.parameter.passEmail) {
				return {
					status: 'error',
					message: e.parameter.passEmail + ' already registered'
				};
			}
		}

		let timestamp =
			Utilities.formatDate(date, 'IST', 'dd MMMM yyyy, h:mm:ss a') +
			' IST';

		// let range = sheet.getRange('F2:F');
		// range.setDataValidation(
		// 	SpreadsheetApp.newDataValidation()
		// 		.requireValueInList(['Yes', 'No'])
		// 		.build()
		// );
		// range.setValue('No');

		let uuid = new Date().getTime().toString(36);

		let data = [
			'',
			timestamp,
			uuid,
			e.parameter.name,
			e.parameter.passEmail,
			e.parameter.email,
			'',
			'No',
			''
		];

		sheet.appendRow(data);

		let found = false;
		let reqR = 0;

		lr = sheet.getLastRow();
		for (let i = lr; i > 1; i--) {
			let range = sheet.getRange('C' + i);
			let val = range.getValue();
			if (val === uuid) {
				range.setValue(val + (i % 10));
				sheet
					.getRange(i, 8)
					.setDataValidation(
						SpreadsheetApp.newDataValidation()
							.requireValueInList(['Yes', 'No'])
							.build()
					);
				found = true;
				reqR = i;
				break;
			}
		}

		if (!found) {
			return {
				status: 'error',
				message: 'UUID error occurred'
			};
		}

		let status = 'Confirmed';
		if (reqR > maxActive + 1) {
			let sheetWaiting = ss.getSheetByName('Waitlist');
			let range = sheet.getRange(reqR, 2, 1, 8);
			let values = range.getValues();
			values[0].unshift('');
			sheetWaiting.appendRow(values[0]);
			sheet.deleteRow(reqR);

			let aplr = sheetWaiting.getLastRow();
			status = 'Waitlist (' + (aplr - 1) + ')';
		}

		let html = registrationHTML
			.replace('{{name}}', e.parameter.name)
			.replace('{{passEmail}}', e.parameter.passEmail)
			.replace('{{status}}', status);

		const subject = 'Registration Successful';
		const body = '';
		const options = {
			htmlBody: html,
			name: 'Akkalkot trip'
		};

		let recepient = e.parameter.passEmail;

		if (e.parameter.email !== 'self') {
			options.cc = e.parameter.passEmail;
			recepient = e.parameter.email;
		}

		GmailApp.sendEmail(recipient, subject, body, options);

		return {
			status: 'success',
			status: status
		};
	} catch (err) {
		return { status: 'error', message: 'Unknown error occurred!' };
	}
};
