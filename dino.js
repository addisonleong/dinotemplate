// This a basic templating engine,
// built to quickly output HTML from templates.
// Supports string options and include.
var fs = require('fs');

/* The template engine */
exports.express = function(filePath, options, callback) {
	fs.readFile(filePath, function (err, content) {
		if (err) return callback(new Error(err));
		var file = content.toString();
		file = handleConditionals(file, options);
		file = handleIncludes(file);
		file = handleComponents(file, options);
		file = handleOptions(file, options);
		return callback(null, file);
	});
}

/* An easy way to handle dynamic component creation */
// Parameters:
// - data: The data to render
//         The format for data is an array with dictionary values:
//         [
//            {
//               title: "Java"
//            },
//            {
//               title: "C++"
//            }
//         ]
// - component: The component to render
// Returns:
// - The components as plain HTML text
function renderComponent(data, component) {
	var result = "";
	for (i in data) {
		var file = render("views/components/" + component + '.dino', data[i]);
		if (file) {
			result += file;
		} else {
			return "";
		}
	}
	return result;
}

/* Renders dino files synchronously */
// Parameters:
// - filePath: The path to the dino file
// - options: Options to render into the file
// Returns:
// - The file as plain HTML text
function render(filePath, options) {
	try {
		var contents = fs.readFileSync(filePath, options);
		contents = contents.toString();
		contents = handleConditionals(contents, options);
		contents = handleOptions(contents, options);
		contents = handleComponents(contents, options);
		contents = handleIncludes(contents);
		return contents;
	} catch(e) {
		return "";
	}
}

/* Renders dino text synchronously */
// Parameters:
// - file: The dino file
// - options: Options to render into the file
// Returns:
// - The file as plain HTML text
function renderText(file, options) {
	try {
		contents = file;
		contents = handleConditionals(contents, options);
		contents = handleIncludes(contents);
		contents = handleComponents(contents, options);
		contents = handleOptions(contents, options);
		return contents;
	} catch(e) {
		return "";
	}
}

/* Finds if statements and executes the appropriate calls */
// Parameters:
// - file: The file to render
// - options: The options
// Returns:
// - The file with the conditionals executed
function handleConditionals(file, options) {
	var regex = /<%=\s*if\s+\((\w+)\s*==\s*([\w\d]+)\)\s+then\s+\((.*?)\)\s*%>/g;
	// var regex = /<%= if \((login)==(true)\) then \((include header)\) %>/g;
	var matches = matchRegex(file, regex, 3);
	if (matches) {
		for (i in matches) {
			if (matches[i][0] in options) {
				if (options[matches[i][0]] == eval(matches[i][1])) {
					// console.log("<%= " + matches[i][2] + " %>")
					// console.log(renderText("<%= " + matches[i][2] + " %>", options));
					var oldValue = '<%=\\s*if\\s+\\(' + matches[i][0] + '\\s*==\\s*' + matches[i][1] + '\\)\\s+then\\s+\\(' + matches[i][2] + '\\)\\s*%>';
					file = file.replace(new RegExp(oldValue, 'g'), renderText("<%= " + matches[i][2] + " %>", options));
				} else {
					var oldValue = '<%=\\s*if\\s+\\(' + matches[i][0] + '\\s*==\\s*' + matches[i][1] + '\\)\\s+then\\s+\\(' + matches[i][2] + '\\)\\s*%>';
					file = file.replace(new RegExp(oldValue, 'g'), "");
				}
			} else {
				var oldValue = '<%=\\s*if\\s+\\(' + matches[i][0] + '\\s*==\\s*' + matches[i][1] + '\\)\\s+then\\s+\\(' + matches[i][2] + '\\)\\s*%>';
				file = file.replace(new RegExp(oldValue, 'g'), "");
			}
		}
	}
	return file;
}

/* Replaces options with appropriate inputs */
// Parameters:
// - file: The file to render
// - options: The options
// Returns:
// - The file with the options inserted
function handleOptions(file, options) {
	var regex = /<%=\s*(\S+)\s*%>(?!>)/g;
	var matches = matchRegex(file, regex, 1);
	if (matches) {
		for (i in matches) {
			if (matches[i][0] in options) {
				var oldValue = '<%=\\s*(' + matches[i][0] + ')\\s*%>(?!>)';
				file = file.replace(new RegExp(oldValue, 'g'), options[matches[i][0]]);
			}
		}
	}
	return file;
}

/* Includes additional templates in template output */
// Parameters:
// - file: The name of the file to render to
// Returns:
// - The file with the included partial inserted
function handleIncludes(file) {
	var regex = /<%=\s*include (\S+)\s*%>(?!>)/g;
	var matches = matchRegex(file, regex, 1);
	if (matches) {
		for (i in matches) {
			var oldValue = '<%=\\s*include ' + matches[i][0] + '\\s*%>(?!>)';
			file = file.replace(new RegExp(oldValue, 'g'), render('views/partials/' + matches[i][0] + '.dino', null));
		}
	}
	return file;
}

/* Renders components in output */
// Parameters:
// - file: The name of the file to render to
// - options: The options
// Returns:
// - The file with the components rendered
function handleComponents(file, options) {
	var regex = /<%=\s*foreach\s+in\s+(\S+)\s+render\s+(\S+)\s*%>(?!>)/g;
	var matches = matchRegex(file, regex, 2);
	if (matches) {
		for (i in matches) {
			var oldValue = '<%=\\s*foreach\\s+in\\s+' + matches[i][0] + '\\s+render\\s+' + matches[i][1] + '\\s*%>(?!>)';
			file = file.replace(new RegExp(oldValue, 'g'), renderComponent(options[matches[i][0]], matches[i][1]));
		}
	}
	return file;
}

/* A helper function to improve Regex in Javascript */
/* This function is not complete. It does what it needs to for now, */
/* but could use some editing to make it more performant */
// Parameters:
// - string: The string to use
// - regex: The pattern to match
// - groups: The number of capture groups
// Returns:
// - The matches
function matchRegex(string, regex, groups) {
	var result = [];
	while ((match = regex.exec(string)) !== null) {
		array = [];
		for (i = 0; i != groups; i++) {
			try {
				array.push(match[i+1]);
			} catch (e) {
				console.log("Number of groups does not match number of capture groups in pattern");
			}
		}
		result.push(array);
	}
	return result;
}