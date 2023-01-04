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
			if (sheet.getRange(i, 5).getValue() === e.passEmail) {
				return {
					status: 'error',
					message: e.passEmail + ' already registered'
				};
			}
		}

		let date = new Date();

		let timestamp = Utilities.formatDate(
			date,
			'IST',
			'dd MMMM yyyy, h:mm:ss a'
		);

		let uuid = date.getTime().toString(36);

		let data = [
			'',
			timestamp,
			uuid,
			e.name,
			e.passEmail,
			e.email,
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
			.replace('{{name}}', e.name)
			.replace('{{passEmail}}', e.passEmail)
			.replace('{{status}}', status);

		const subject = 'Registration Successful';
		const body = '';
		const options = {
			htmlBody: html,
			name: 'Akkalkot trip'
		};

		let recepient = e.passEmail;

		if (e.email !== 'self') {
			options.cc = e.passEmail;
			recepient = e.email;
		}

		GmailApp.sendEmail(recepient, subject, body, options);

		return {
			status: 'success',
			reg: status
		};
	} catch (err) {
		return {
			status: 'error',
			message: 'Unknown error occurred!',
			error: err
		};
	}
};
