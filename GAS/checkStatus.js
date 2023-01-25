/**
 * @param {Object} e - Event object
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet object
 */
const checkStatus = (e, ss) => {
	try {
		let sheet = ss.getSheetByName('Active');
		let lr = sheet.getLastRow();

		let searchColumn = 3;
		if (e.data.includes('@')) {
			searchColumn = 5;
		}

		for (let i = 2; i <= lr; i++) {
			if (
				sheet.getRange(i, searchColumn).getValue().toLowerCase() ===
				e.data.toLowerCase()
			) {
				return {
					status: 'success',
					message: 'Confirmed'
				};
			}
		}

		let wlSheet = ss.getSheetByName('Waitlist');
		let wlLr = wlSheet.getLastRow();

		for (let i = 2; i <= wlLr; i++) {
			if (
				wlSheet.getRange(i, searchColumn).getValue().toLowerCase() ===
				e.data.toLowerCase()
			) {
				return {
					status: 'success',
					message: 'Waitlist: ' + (i - 1)
				};
			}
		}

		let dataType = 'registration ID';
		if (searchColumn === 5) {
			dataType = 'email';
		}

		return {
			status: 'error',
			message: 'Could not find ' + dataType + ': <b>' + e.data + '</b>'
		};
	} catch (err) {
		return {
			status: 'error',
			message: 'Unknown error occurred!',
			error: err
		};
	}
};
