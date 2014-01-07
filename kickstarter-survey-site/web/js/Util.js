(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition();
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Util",this,function definition(name,context) {
	"use strict";

	// make session store (h5.storage API) backed by session cookies
	function sessionCookiesStorage() {

		function createCookie(name,value) {
			document.cookie = name + "=" + value + "; path=/";
		}

		function readCookie(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(";");
			for(var i=0; i<ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == " ") {
					c = c.substring(1,c.length);
				}
				if (c.indexOf(nameEQ) === 0) {
					return c.substring(nameEQ.length,c.length);
				}
			}
			return null;
		}

		function deleteCookie(name) {
			var d = new Date();
			d.setTime(d.getTime() - 10);
			document.cookie = name + "=; expires=" + d.toGMTString() + "; path=/";
		}

		var public_api = {
			save: function(data) {
				for (var key in data) {
					if (typeof data[key] === "object") {
						try {
							data[key] = JSON.stringify(data[key]);
						} catch (err) {}
					}
					createCookie(key,String(data[key]));
				}
				return public_api;
			},
			get: function(keys) {
				var ret = {};

				if (Object.prototype.toString.call(keys) !== "[object Array]") {
					keys = [keys];
				}
				for (var i=0; i<keys.length; i++) {
					ret[keys[i]] = readCookie(keys[i]);
				}
				if (keys.length < 2) {
					if (keys.length > 0 && (keys[0] in ret)) {
						return ret[keys[0]];
					}
					return;
				}
				return ret;
			},
			discard: function(keys) {
				if (Object.prototype.toString.call(keys) !== "[object Array]") {
					keys = [keys];
				}
				for (var i=0; i<keys.length; i++) {
					deleteCookie(keys[i]);
				}
				return public_api;
			}
		};

		return public_api;
	}

	function guid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}

	function startSession(sessionID) {
		if (session_store) {
			session_store.save({
				session_id: sessionID
			});
		}

		public_api.session_id = sessionID;
	}

	function restoreSession() {
		var sess_id;

		if (session_store) {
			sess_id = session_store.get("session_id");
			if (sess_id) {
				public_api.session_id = sess_id;
			}
		}

		if (public_api.session_id) {
			return ASQ(function(done){
				$.ajax({
					type: "POST",
					url: "/session/verify",
					data: JSON.stringify({
						session_id: public_api.session_id
					}),
					processData: false,
					contentType: "application/javascript; charset=UTF-8",
					dataType: "json"
				})
				.success(function(res) {
					if (res.session_id) {
						done(res.session_id);
					}
					else {
						done.fail();
					}
				})
				.error(done.fail);
			})
			.or(killSession);
		}
		else {
			return ASQ(function(done){
				done.fail();
			});
		}
	}

	function killSession() {
		if (session_store) {
			session_store.discard([ "session_id" ]);
		}

		public_api.session_id = null;
	}

	function requiredSession(redirectURL) {
		if (!public_api.session_id) {
			Pages.gotoPage("/");
			return false;
		}
		return true;
	}


	var public_api,

		// feature tests for localStorage/sessionStorage
		local_storage_available = (function(test) {
			try {
				localStorage.setItem(test, test);
				localStorage.removeItem(test);
				return true;
			}
			catch (err) {
				return false;
			}
		})("ydkjs:kickstarter"),
		session_storage_available = (function(test) {
			// TODO: removetemp hack for cookies-based sessionStorage
			return true;

			//try {
			//	sessionStorage.setItem(test, test);
			//	sessionStorage.removeItem(test);
			//	return true;
			//}
			//catch (err) {
			//	return false;
			//}
		})("ydkjs:kickstarter"),

		local_store,
		session_store
	;

	// browser storage
	if (context && "h5" in context) {
		if (local_storage_available) {
			local_store = h5.storage();
		}
		if (session_storage_available) {
			//session_store = h5.storage({ expires: "session" });
			session_store = sessionCookiesStorage();
		}
	}

	public_api = {
		guid: guid,
		startSession: startSession,
		restoreSession: restoreSession,
		killSession: killSession,
		requiredSession: requiredSession,

		local_store: local_store,
		session_store: session_store
	};

	return public_api;
});
