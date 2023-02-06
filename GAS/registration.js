let validation = SpreadsheetApp.newDataValidation()
	.requireValueInList(['No', 'Yes', 'Partially Paid'])
	.setAllowInvalid(false)
	.build();

/**
 * @param {Object} e - Event object
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet object
 */
const registration = (e, ss) => {
	try {
		let sheet = ss.getSheetByName('Active');

		let date = new Date();

		let timestamp = Utilities.formatDate(
			date,
			'IST',
			'dd MMMM yyyy, h:mm:ss a'
		);

		let uuid = date.getTime().toString(36).toUpperCase();

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

		let lr = sheet.getLastRow();
		for (let i = lr; i > 1; i--) {
			let range = sheet.getRange('C' + i);
			let val = range.getValue();
			if (val === uuid) {
				range.setValue(val + (i % 10));
				// sheet.getRange('H2:H' + i).setDataValidation(validation);
				sheet
					.getRange(2, paymentCol, i - 1, 1)
					.setDataValidation(validation);
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
			let wlSheet = ss.getSheetByName('Waitlist');
			let range = sheet.getRange(reqR, 2, 1, 26);
			let values = range.getValues();
			values[0].unshift('');
			wlSheet.appendRow(values[0]);
			sheet.deleteRow(reqR);

			let aplr = wlSheet.getLastRow();
			status = 'Waitlist (' + (aplr - 1) + ')';
		}

		let html = registrationHTML
			.replace('{{name}}', e.name)
			.replace('{{passEmail}}', e.passEmail)
			.replace('{{status}}', status)
			.replace('{{uuid}}', uuid)
			.replace(/{{viewLink}}/g, regViewLink);

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
			reg: status,
			uuid: uuid
		};
	} catch (err) {
		return {
			status: 'error',
			message: 'Unknown error occurred!',
			error: err
		};
	}
};
