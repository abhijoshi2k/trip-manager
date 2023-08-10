let validation = SpreadsheetApp.newDataValidation()
	.requireValueInList([
		'No',
		'Yes, RM Mistry',
		'Yes, Dharmesh',
		'Yes, Ajay',
		'Yes, NVJ',
		'Yes, DSP',
		'Yes, Vivek'
	])
	.setAllowInvalid(false)
	.build();

/**
 * @param {Object} e - Event object
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet object
 */
const registration = (e, ss) => {
	try {
		if (e.admin && e.adminPass !== masterPwd) {
			return {
				status: 'error',
				message: 'Incorrect password!'
			};
		} else if (e.admin) {
			let verificationStat = verification(e, ss);
			if (verificationStat.status !== 'success') {
				return verificationStat;
			}
		}

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
			'',
			'',
			'',
			e.age,
			e.mobile,
			e.emergency,
			e.boarding,
			e.alighting,
			e.office_location,
			e.department,
			'No',
			e.passEmail,
			e.email,
			e.admin ? 'Admin registration' : '',
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
				uuid = val + (i % 10);
				range.setValue(uuid);
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
			let sheetName = 'Waitlist';
			if (e.pwl) {
				sheetName = 'Priority Waitlist';
			}

			let wlSheet = ss.getSheetByName(sheetName);
			let range = sheet.getRange(reqR, 2, 1, 26);
			let values = range.getValues();
			values[0].unshift('');
			wlSheet.appendRow(values[0]);
			sheet.deleteRow(reqR);

			let aplr = wlSheet.getLastRow();
			status = sheetName + ' (' + (aplr - 1) + ')';
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
