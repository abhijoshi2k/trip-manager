const sendCanVerificationMail = (recepient, name, uuid) => {
	const code = Math.floor(100000 + Math.random() * 900000);
	const html = verifyCancellationHTML
		.replace('{{name}}', name)
		.replace('{{uuid}}', uuid)
		.replace('{{code}}', code);

	MailApp.sendEmail(recepient, 'Akkalkot trip cancellation', '', {
		htmlBody: html,
		name: 'Akkalkot trip'
	});

	return code;
};

/**
 * @param {Object} e - Event object
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet object
 */
const verifyCancellation = (e, ss) => {
	try {
		let statusSheet = ss.getSheetByName('Form Status');

		let maintenance = statusSheet.getRange(3, 2).getValue();
		if (maintenance === 'On') {
			return {
				status: 'error',
				message:
					'Website is down for <b>maintenance</b>. Please try again later.'
			};
		}

		let status = statusSheet.getRange(2, 2).getValue();

		if (status === 'Temporarily Closed') {
			return {
				status: 'error',
				message:
					'Cancellation is <b>temporarily closed</b>. Please try again later.'
			};
		} else if (status === 'Permanently Closed') {
			return {
				status: 'error',
				message:
					'Cancellation is <b>permanently closed</b>. Contact admin for further details.'
			};
		}

		// data can be email address or registration ID
		const { data } = e;

		let searchCol = regIdCol;
		if (data.includes('@')) {
			searchCol = passEmailCol;
		}

		let sheet = ss.getSheetByName('Active');
		let lr = sheet.getLastRow();

		for (let i = 2; i <= lr; i++) {
			if (
				sheet.getRange(i, searchCol).getValue().toLowerCase() ===
				data.toLowerCase()
			) {
				let name = sheet.getRange(i, nameCol).getValue();
				let uuid = sheet.getRange(i, regIdCol).getValue();
				let email = sheet.getRange(i, passEmailCol).getValue();

				let regBy = sheet.getRange(i, registeredByCol).getValue();
				if (regBy.toLowerCase().trim() !== 'self') {
					email = regBy;
				}

				let code = sendCanVerificationMail(email, name, uuid);

				return {
					status: 'success',
					code: code,
					uuid: uuid,
					email: email
				};
			}
		}

		let wlSheet = ss.getSheetByName('Waitlist');
		let wlLr = wlSheet.getLastRow();

		for (let i = 2; i <= wlLr; i++) {
			if (
				wlSheet.getRange(i, searchCol).getValue().toLowerCase() ===
				data.toLowerCase()
			) {
				let name = wlSheet.getRange(i, nameCol).getValue();
				let uuid = wlSheet.getRange(i, regIdCol).getValue();
				let email = wlSheet.getRange(i, passEmailCol).getValue();

				let regBy = wlSheet.getRange(i, registeredByCol).getValue();
				if (regBy.toLowerCase().trim() !== 'self') {
					email = regBy;
				}

				let code = sendCanVerificationMail(email, name, uuid);

				return {
					status: 'success',
					code: code,
					uuid: uuid,
					email: email
				};
			}
		}

		let pwlSheet = ss.getSheetByName('Priority Waitlist');
		let pwlLr = pwlSheet.getLastRow();

		for (let i = 2; i <= pwlLr; i++) {
			if (
				pwlSheet.getRange(i, searchCol).getValue().toLowerCase() ===
				data.toLowerCase()
			) {
				return {
					status: 'error',
					message:
						'Priority waitlist cancellations can only be done by admin.'
				};
			}
		}

		return {
			status: 'error',
			message: 'No registration found with the given data!'
		};
	} catch (err) {
		return {
			status: 'error',
			message: 'Unknown error occurred!',
			error: err
		};
	}
};
