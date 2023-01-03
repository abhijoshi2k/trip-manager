const sheetURL =
	'https://docs.google.com/spreadsheets/d/14BWPC4ec-02ERfk-vljz2Ve8zDiCyYLpOn-Xrcg7slI/edit#gid=0';
var ss = SpreadsheetApp.openByUrl(sheetURL);

function doPost(e) {
	const exs = {
		verification: verification,
		registration: registration
	};

	if (exs[e.parameters.ex]) {
		return ContentService.createTextOutput(
			JSON.stringify(exs[e.parameters.ex](e, ss))
		).setMimeType(ContentService.MimeType.JSON);
	} else {
		return ContentService.createTextOutput(
			JSON.stringify({ status: 'Parameter not found' })
		).setMimeType(ContentService.MimeType.JSON);
	}
}
