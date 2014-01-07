module.exports = function(grunt) {
	var path = require("path"), previous_force_state = grunt.option("force");

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		forever: {
			options: {
				index: path.join(__dirname,"server.js"),
				logDir: ".",
				logFile: "output.txt",
				errFile: "error.txt"
			}
		},
		watch: {
			templates: {
				files: [
					path.join("templates","**","*.html"),
					path.join("templates","**","*.js")
				],
				tasks: ["shell:build_templates"]
			}
		},
		shell: {
			build_templates: {
				options: {
					failOnError: true,
					stderr: true,
					stdout: true
				},
				command: path.join(__dirname, "build-templates.js")
			}
		}
	});

	// Load the plugins
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-shell");
	grunt.loadNpmTasks('grunt-forever');

	// define tasks
	grunt.registerTask("server-shutdown-listener",function(step){
		var name = this.name;
		if (step === "exit") {
			process.exit();
		}
		else {
			process.on("SIGINT",function(){
				grunt.log.writeln("").writeln("Shutting down server...");
				grunt.task.run([
					"force:on",
					"forever:stop",
					name + ":exit"
				]);
				grunt.task.current.async()();
			});
		}
	});

	grunt.registerTask("default",function(){
		grunt.log.writeln("Please either run 'dev' or 'prod' target.");
		return false;
	});

	grunt.registerTask("force",function(set){
		if (set === "on") {
			grunt.option("force",true);
		}
		else if (set === "off") {
			grunt.option("force",false);
		}
		else if (set === "restore") {
			grunt.option("force",previous_force_state);
		}
	});

	grunt.registerTask("dev", [
		"shell:build_templates",
		"force:on",	// temporary hack to turn on --force state
		"forever:stop",
		"force:restore", // temporary hack to restore previous --force state
		"forever:start",
		"server-shutdown-listener",
		"watch"
	]);

	grunt.registerTask("set-prod-env",function(){
		process.env.NODE_ENV = "production";
	});

	grunt.registerTask("prod", [
		"set-prod-env",
		"shell:build_templates",
		"force:on",	// temporary hack to turn on --force state
		"forever:stop",
		"force:restore", // temporary hack to restore previous --force state
		"forever:start"
	]);
};
