function doPost(e) {
	const exs = {
		verification: verification,
		registration: registration
	};

	if (exs[e.parameters.ex]) {
		return ContentService.createTextOutput(
			JSON.stringify(exs[e.parameters.ex](e))
		).setMimeType(ContentService.MimeType.JSON);
	} else {
		return ContentService.createTextOutput(
			JSON.stringify({ status: 'Parameter not found' })
		).setMimeType(ContentService.MimeType.JSON);
	}
}
