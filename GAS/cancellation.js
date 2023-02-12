const sendCancellationMail = (recepient, name, uuid, cc) => {
	const subject = 'Cancellation Successful';
	const body = '';
	const options = {
		htmlBody: cancellationHTML
			.replace('{{name}}', name)
			.replace('{{uuid}}', uuid),
		name: 'Akkalkot trip'
	};

	if (cc.trim() !== 'self') {
		options.cc = cc.trim();
	}

	GmailApp.sendEmail(recepient, subject, body, options);
};

/**
 * @param {Object} e - Event object
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet object
 */
const cancellation = (e, ss) => {
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

		let date = new Date();

		let timestamp = Utilities.formatDate(
			date,
			'IST',
			'dd MMMM yyyy, h:mm:ss a'
		);

		let canSheet = ss.getSheetByName('Cancelled');

		let sheet = ss.getSheetByName('Active');
		let lr = sheet.getLastRow();

		let wlSheet = ss.getSheetByName('Waitlist');
		let pwlSheet = ss.getSheetByName('Priority Waitlist');

		for (let i = 2; i <= lr; i++) {
			if (
				sheet.getRange(i, regIdCol).getValue().toLowerCase() ===
				e.regid.toLowerCase()
			) {
				let initialRemarks = sheet
					.getRange(i, autoRemarksCol)
					.getValue();
				if (initialRemarks.length > 0) {
					initialRemarks += '\n';
				}
				sheet
					.getRange(i, autoRemarksCol)
					.setValue(initialRemarks + 'Cancelled at ' + timestamp);

				let cName = sheet.getRange(i, nameCol).getValue();
				let cUuid = sheet.getRange(i, regIdCol).getValue();
				let cRegBy = sheet.getRange(i, registeredByCol).getValue();
				let cPassEmail = sheet.getRange(i, passEmailCol).getValue();

				let cLr = canSheet.getLastRow();

				sheet
					.getRange(i, 2, 1, 26)
					.copyTo(canSheet.getRange(cLr + 1, 2));

				let wl = false;
				let changeName = '';
				let changePassEmail = '';
				let changeUuid = '';
				let changeRegBy = '';

				if (pwlSheet.getLastRow() > 1) {
					let init = pwlSheet.getRange(2, autoRemarksCol).getValue();
					if (init.length > 0) {
						init += '\n';
					}

					pwlSheet
						.getRange(2, autoRemarksCol)
						.setValue(
							init +
								'Confirmed via priority WL replacing ' +
								sheet.getRange(i, regIdCol).getValue()
						);

					changeName = pwlSheet.getRange(2, nameCol).getValue();
					changePassEmail = pwlSheet
						.getRange(2, passEmailCol)
						.getValue();
					changeUuid = pwlSheet.getRange(2, regIdCol).getValue();
					changeRegBy = pwlSheet
						.getRange(2, registeredByCol)
						.getValue();

					pwlSheet.getRange(2, 2, 1, 26).copyTo(sheet.getRange(i, 2));
					pwlSheet.deleteRow(2);
					wl = true;
				} else if (wlSheet.getLastRow() > 1) {
					let init = wlSheet.getRange(2, autoRemarksCol).getValue();
					if (init.length > 0) {
						init += '\n';
					}

					wlSheet
						.getRange(2, autoRemarksCol)
						.setValue(
							init +
								'Confirmed via WL replacing ' +
								sheet.getRange(i, regIdCol).getValue()
						);

					changeName = wlSheet.getRange(2, nameCol).getValue();
					changePassEmail = wlSheet
						.getRange(2, passEmailCol)
						.getValue();
					changeUuid = wlSheet.getRange(2, regIdCol).getValue();
					changeRegBy = wlSheet
						.getRange(2, registeredByCol)
						.getValue();

					wlSheet.getRange(2, 2, 1, 26).copyTo(sheet.getRange(i, 2));
					wlSheet.deleteRow(2);
					wl = true;
				}

				if (!wl) {
					sheet.deleteRow(i);
				} else {
					let body = statusChangeHTML
						.replace('{{name}}', changeName)
						.replace('{{passEmail}}', changePassEmail)
						.replace('{{uuid}}', changeUuid)
						.replace(/{{viewLink}}/g, regViewLink);

					let options = {
						htmlBody: body,
						name: 'Akkalkot trip'
					};

					if (changeRegBy.trim() !== 'self') {
						options.cc = changeRegBy;
					}

					GmailApp.sendEmail(
						changePassEmail,
						'Akkalkot trip status change',
						'',
						options
					);
				}

				sendCancellationMail(cPassEmail, cName, cUuid, cRegBy);

				return { status: 'success' };
			}
		}

		let wlLr = wlSheet.getLastRow();

		for (let i = 2; i <= wlLr; i++) {
			if (
				wlSheet.getRange(i, regIdCol).getValue().toLowerCase() ===
				e.regid.toLowerCase()
			) {
				let initialRemarks = wlSheet
					.getRange(i, autoRemarksCol)
					.getValue();
				if (initialRemarks.length > 0) {
					initialRemarks += '\n';
				}
				wlSheet
					.getRange(i, autoRemarksCol)
					.setValue(initialRemarks + 'Cancelled at ' + timestamp);

				let cName = wlSheet.getRange(i, nameCol).getValue();
				let cUuid = wlSheet.getRange(i, regIdCol).getValue();
				let cRegBy = wlSheet.getRange(i, registeredByCol).getValue();
				let cPassEmail = wlSheet.getRange(i, passEmailCol).getValue();

				let cLr = canSheet.getLastRow();

				wlSheet
					.getRange(i, 2, 1, 26)
					.copyTo(canSheet.getRange(cLr + 1, 2));

				wlSheet.deleteRow(i);

				sendCancellationMail(cPassEmail, cName, cUuid, cRegBy);

				return { status: 'success' };
			}
		}

		let pwlLr = pwlSheet.getLastRow();

		for (let i = 2; i <= pwlLr; i++) {
			if (
				pwlSheet.getRange(i, regIdCol).getValue().toLowerCase() ===
				e.regid.toLowerCase()
			) {
				let initialRemarks = pwlSheet
					.getRange(i, autoRemarksCol)
					.getValue();
				if (initialRemarks.length > 0) {
					initialRemarks += '\n';
				}
				pwlSheet
					.getRange(i, autoRemarksCol)
					.setValue(initialRemarks + 'Cancelled at ' + timestamp);

				let cName = pwlSheet.getRange(i, nameCol).getValue();
				let cUuid = pwlSheet.getRange(i, regIdCol).getValue();
				let cRegBy = pwlSheet.getRange(i, registeredByCol).getValue();
				let cPassEmail = pwlSheet.getRange(i, passEmailCol).getValue();

				let cLr = canSheet.getLastRow();

				pwlSheet
					.getRange(i, 2, 1, 26)
					.copyTo(canSheet.getRange(cLr + 1, 2));

				pwlSheet.deleteRow(i);

				sendCancellationMail(cPassEmail, cName, cUuid, cRegBy);

				return { status: 'success' };
			}
		}

		return { status: 'error', message: 'No such registration ID found!' };
	} catch (err) {
		return { status: 'error', message: 'Unknown error occurred!' };
	}
};
