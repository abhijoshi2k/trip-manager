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

				let cLr = canSheet.getLastRow();

				sheet
					.getRange(i, 2, 1, 26)
					.copyTo(canSheet.getRange(cLr + 1, 2));

				let wl = false;
				if (pwlSheet.getLastRow() > 1) {
					pwlSheet
						.getRange(2, autoRemarksCol)
						.setValue(
							'Confirmed via priority WL replacing ' +
								sheet.getRange(i, regIdCol).getValue()
						);
					pwlSheet.getRange(2, 2, 1, 26).copyTo(sheet.getRange(i, 2));
					pwlSheet.deleteRow(2);
					wl = true;
				} else if (wlSheet.getLastRow() > 1) {
					wlSheet
						.getRange(2, autoRemarksCol)
						.setValue(
							'Confirmed via WL replacing ' +
								sheet.getRange(i, regIdCol).getValue()
						);
					wlSheet.getRange(2, 2, 1, 26).copyTo(sheet.getRange(i, 2));
					wlSheet.deleteRow(2);
					wl = true;
				}

				if (!wl) {
					sheet.deleteRow(i);
				}

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

				let cLr = canSheet.getLastRow();

				wlSheet
					.getRange(i, 2, 1, 26)
					.copyTo(canSheet.getRange(cLr + 1, 2));

				wlSheet.deleteRow(i);

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

				let cLr = canSheet.getLastRow();

				pwlSheet
					.getRange(i, 2, 1, 26)
					.copyTo(canSheet.getRange(cLr + 1, 2));

				pwlSheet.deleteRow(i);

				return { status: 'success' };
			}
		}

		return { status: 'error', message: 'No such registration ID found!' };
	} catch (err) {
		return { status: 'error', message: 'Unknown error occurred!' };
	}
};
