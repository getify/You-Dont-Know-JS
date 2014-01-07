(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition();
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Tmpls",this,function definition(name,context) {
	"use strict";

	function init() {
		/*TEMPLATES*/
	}

	var public_api;

	public_api = {
		init: init
	};

	return public_api;
});
