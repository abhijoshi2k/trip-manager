/**
 * @param {Object} e - Event object
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet object
 */
const verification = (e, ss) => {
	try {
		const { email, reg_name, passEmail } = e;

		let statusSheet = ss.getSheetByName('Form Status');

		let maintenance = statusSheet.getRange(3, 2).getValue();
		if (maintenance === 'On' && passEmail != 'abhijoshi2k@gmail.com') {
			return {
				status: 'error',
				message:
					'Website is down for <b>maintenance</b>. Please try again later.'
			};
		}

		let status = statusSheet.getRange(1, 2).getValue();

		if (status === 'Temporarily Closed') {
			return {
				status: 'error',
				message:
					'Registration is <b>temporarily closed</b>. Please try again later.'
			};
		} else if (status === 'Permanently Closed') {
			return {
				status: 'error',
				message:
					'Registration is <b>permanently closed</b>. No new entries will be accepted.'
			};
		}

		let sheet = ss.getSheetByName('Active');
		let lr = sheet.getLastRow();

		for (let i = 2; i <= lr; i++) {
			if (
				sheet.getRange(i, passEmailCol).getValue().toLowerCase() ===
				passEmail.toLowerCase()
			) {
				return {
					status: 'error',
					message: passEmail + ' already registered (Confirmed)'
				};
			}
		}

		let wlSheet = ss.getSheetByName('Waitlist');
		let wlLr = wlSheet.getLastRow();

		for (let i = 2; i <= wlLr; i++) {
			if (
				wlSheet.getRange(i, passEmailCol).getValue().toLowerCase() ===
				passEmail.toLowerCase()
			) {
				return {
					status: 'error',
					message:
						passEmail +
						' already registered (Waitlist: ' +
						(i - 1) +
						')'
				};
			}
		}

		let pwlSheet = ss.getSheetByName('Priority Waitlist');
		let pwlLr = pwlSheet.getLastRow();

		for (let i = 2; i <= pwlLr; i++) {
			if (
				pwlSheet.getRange(i, passEmailCol).getValue().toLowerCase() ===
				passEmail.toLowerCase()
			) {
				return {
					status: 'error',
					message:
						passEmail +
						' already registered (Priority Waitlist: ' +
						(i - 1) +
						')'
				};
			}
		}

		const code = Math.floor(100000 + Math.random() * 900000);

		if (!e.admin) {
			const html = verificationHTML
				.replace('{{name}}', reg_name)
				.replace('{{code}}', code);

			const subject = 'Akkalkot registration';
			const body = '';
			const options = {
				htmlBody: html,
				name: 'Akkalkot trip'
			};
			if (MailApp.getRemainingDailyQuota() < 4) {
				return {
					status: 'error',
					message: 'Daily registrations exceeded. Try again tomorrow.'
				};
			}

			GmailApp.sendEmail(email, subject, body, options);
		}

		return { status: 'success', code: code };
	} catch (err) {
		return { status: 'error', message: 'Unknown error occurred!' };
	}
};
