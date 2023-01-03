const verification = (e, ss) => {
	try {
		const { email, name } = e.parameters;
		const code = Math.floor(100000 + Math.random() * 900000);
		const html = verificationHTML
			.replace('{{name}}', name)
			.replace('{{code}}', code);

		const subject = 'Verify Your E-mail Address';
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

		return { status: 'success', code: code };
	} catch (err) {
		return { status: 'error', message: 'Unknown error occurred!' };
	}
};
