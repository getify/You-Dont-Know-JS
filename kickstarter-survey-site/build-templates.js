#!/usr/bin/env node

// process the templates and build the template bundle

function processTemplates(dir,collectionPrefix) {
	var files = fs.readdirSync(dir);

	files.forEach(function(file){
		var st = fs.statSync(path.join(dir,file)),
			contents, collection_id
		;

		// template file to read contents and compile?
		if (st.isFile() && /\.grips\.html$/.test(file)) {
			console.log("Processing template: " + (collectionPrefix ? collectionPrefix + "/" : "") + file);

			contents = fs.readFileSync(path.join(dir,file),{ encoding: "utf8" });

			try {
				bundle_str += grips.compileCollection(
					/*source=*/contents,
					/*collectionID=*/collectionPrefix+"/"+(file.replace(/(?:\.?index)?\.grips\.html$/,"")),
					/*initialize=*/false
				);
			}
			catch (err) {
				console.error(err.stack || err.toString());
				process.exit(1);
			}
		}
		else if (st.isDirectory()) {
			processTemplates(path.join(dir,file),collectionPrefix+"/"+file);
		}
	});
}

var path = require("path"),
	fs = require("fs"),

	PROD = (process.env.NODE_ENV === "production"),

	grips = require("grips")[
		// either pull in production or debug of grips engine
		PROD ? "grips" : "debug"
	],

	bundle_str = "",

	bundle_wrapper = fs.readFileSync(path.join(__dirname,"templates","tmpls-wrapper.js"),{ encoding: "utf8" })
;

if (PROD) {
	console.log("*** Production template build ***");
}
else {
	console.log("*** Debug template build ***");
}

processTemplates(
	/*dir=*/path.join(__dirname,"templates"),
	/*collectionPrefix=*/""
);

bundle_wrapper = bundle_wrapper.replace(/\/\*TEMPLATES\*\//,function(){ return bundle_str; });

fs.writeFileSync(
	path.join(__dirname,"web","js","Tmpls.js"),
	bundle_wrapper,
	{ encoding: "utf8" }
);
