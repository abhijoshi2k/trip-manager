const sheetURL =
	'https://docs.google.com/spreadsheets/d/14BWPC4ec-02ERfk-vljz2Ve8zDiCyYLpOn-Xrcg7slI/edit#gid=0';
var ss = SpreadsheetApp.openByUrl(sheetURL);

function doPost(e) {
	try {
		const exs = {
			verification: verification,
			registration: registration,
			checkStatus: checkStatus
		};

		e = JSON.parse(e.postData.contents);

		if (exs[e.ex]) {
			return ContentService.createTextOutput(
				JSON.stringify(exs[e.ex](e, ss))
			).setMimeType(ContentService.MimeType.JSON);
		} else {
			return ContentService.createTextOutput(
				JSON.stringify({
					status: 'error',
					message: JSON.stringify(e)
				})
			).setMimeType(ContentService.MimeType.JSON);
		}
	} catch (e) {
		return ContentService.createTextOutput(
			JSON.stringify({
				status: 'Error',
				message: 'Unknown error occurred!'
			})
		).setMimeType(ContentService.MimeType.JSON);
	}
}
