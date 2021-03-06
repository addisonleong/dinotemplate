// This a basic templating engine,
// built to quickly output HTML from templates.
var fs = require('fs');

/* The template engine */
exports.express = function(filePath, options, callback) {
	fs.readFile(filePath, function (err, content) {
		if (err) return callback(new Error(err));
		var file = content.toString();
		file = renderText(file, options);
		return callback(null, file);
	});
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
		return renderText(contents, options);
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
		contents = handleIncludes(contents, options);
		contents = handleComponents(contents, options);
		contents = handleOptions(contents, options);
		return contents;
	} catch(e) {
		return "";
	}
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

/* Finds if statements and executes the appropriate calls */
// Parameters:
// - file: The file to render
// - options: The options
// Returns:
// - The file with the conditionals executed.
function handleConditionals(file, options) {
	var regex = /<%=\s*if\s+\((.+)\)\s+then\s+\((.*?)\)\s*%>/g;
	var matches = matchRegex(file, regex, 2);
	if (matches) {
		for (i in matches) {
			var conditional = matches[i][0];
			var script = matches[i][1];
			let condition = interpretVariables(conditional, options);
			if (condition) {
				var oldValue = '<%=\\s*if\\s+\\(\\s*' + conditional + '\\s*\\)\\s+then\\s+\\(\\s*' + script + '\\s*\\)\\s*%>';
				file = file.replace(new RegExp(oldValue, 'g'), renderText("<%= " + script + " %>", options));
			} else {
				var oldValue = '<%=\\s*if\\s+\\(\\s*' + conditional + '\\s*\\)\\s+then\\s+\\(\\s*' + script + '\\s*\\)\\s*%>';
				file = file.replace(new RegExp(oldValue, 'g'), "");
			}
		}
	}
	return file;
}

/* Interprets variables using options */
// Parameters:
// - string: The string to interpret
// - options: The options
// Returns:
// - The parsed value. This can be used to evaluate conditionals as well as perform basic parsing.
function interpretVariables(string, options) {
	try {
		var codeOutput = "'use strict';\n";
		for (i in options) {
			if (string.indexOf(i) !== -1) {
				let value = options[i];
				if (value && (value.constructor === Array || value.constructor === Object || value.constructor === String)) {
					value = JSON.stringify(value);
				}
				codeOutput += "var " + i + " = " + value + ";\n";
			}
		}
		codeOutput += "return " + string + ";";
		let newFunction = new Function(codeOutput);
		return newFunction();
	} catch (e) {
		return null;
	}
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* Replaces options with appropriate inputs */
// Parameters:
// - file: The file to render
// - options: The options
// Returns:
// - The file with the options inserted
function handleOptions(file, options) {
	var regex = /<%=\s*(\S+)\s*%>/g;
	var matches = matchRegex(file, regex, 1);
	if (matches) {
		for (i in matches) {
			let variable = String(matches[i][0]);
			let value = interpretVariables(variable, options);
			if (value) {
				var oldValue = '<%=\\s*' + escapeRegExp(variable) + '\\s*%>';
				file = file.replace(new RegExp(oldValue, 'g'), value);
			} else {
				var oldValue = '<%=\\s*' + escapeRegExp(variable) + '\\s*%>';
				file = file.replace(new RegExp(oldValue, 'g'), "");
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
function handleIncludes(file, options) {
	var regex = /<%=\s*include (\S+)\s*%>(?!>)/g;
	var matches = matchRegex(file, regex, 1);
	if (matches) {
		for (i in matches) {
			var oldValue = '<%=\\s*include ' + matches[i][0] + '\\s*%>(?!>)';
			file = file.replace(new RegExp(oldValue, 'g'), render('views/partials/' + matches[i][0] + '.dino', options));
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
			var variable = String(matches[i][0]);
			var component = String(matches[i][1]);
			var value = interpretVariables(variable, options);
			var oldValue = '<%=\\s*foreach\\s+in\\s+' + escapeRegExp(variable) + '\\s+render\\s+' + escapeRegExp(component) + '\\s*%>(?!>)';
			file = file.replace(new RegExp(oldValue, 'g'), renderComponent(value, component));
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