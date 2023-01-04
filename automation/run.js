const fs = require('fs');
const exec = require('child_process').exec;

const current = fs.readFileSync('./automation/current.txt', 'utf8');
let index = fs.readFileSync('./docs/index.html', 'utf8');

function execute(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			}
			resolve(stdout);
		});
	});
}

// anonymous function async
(async () => {
	output = await execute('clasp push');
	console.log(output);

	output = await execute('clasp deploy');
	console.log(output);
	// ge string between - and @ using slice
	const version = output
		.slice(output.indexOf('-') + 1, output.indexOf('@'))
		.trim();
	console.log(version);

	index = index.replace(current, version);

	fs.writeFileSync('./docs/index.html', index);
	fs.writeFileSync('./automation/current.txt', version);

	output = await execute('clasp undeploy ' + current);
	console.log(output);
})();
