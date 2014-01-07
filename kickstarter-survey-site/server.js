function handler(req,res) {
	// ensure proper 'Server' header for all responses
	res.setHeader("Server",secret.SERVER_NAME);

	// not a recognized route?
	if (req.headers["host"] !== "kickstarter.youdontknowjs.com" ||
		router(req,res) === false
	) {
		setSecurityHeaders(res);
		res.writeHead(403);
		res.end();
	}
}

function collectPostData(req) {
	return ASQ(function(done){
		var data = "";

		req.addListener("data",function(d){
			data += d;
		});
		req.addListener("end",function(){
			done(data);
		});
		req.resume();
	});
}

function processJSONPostData(data) {
	try {
		data = JSON.parse(data);
		return data;
	}
	catch (err) {
		throw "Invalid or missing data";
	}
}

function processJSONGetData(url) {
	return ASQ()
	.val(function(){
		var url_parts = url_parser.parse(url,/*parseQueryString=*/true), data;

		try {
			data = JSON.parse(url_parts.query.d);
			return data;
		}
		catch (err) {
			throw "Invalid or missing data";
		}
	});
}

// extract session ID from cookie, if any
function processRequestCookieSessionID(req) {
	var cookies = cookie.parse(req.headers.cookie || ""),
		session_id = cookies.session_id
	;

	if (session_id && checkSessionID(session_id)) {
		req.session_id = session_id;
	}
}

function setupJSONResponse(res) {
	res.writeHead(200,{
		"Content-type": "application/javascript; charset=UTF-8"
	});
}

function router(req,res) {
	// extract a request cookie session ID, if any
	processRequestCookieSessionID(req);

	if (req.method === "GET") {
		// static file request?
		if (/^\/(?:js\/(?=.+)|css\/(?=.+)|images\/(?=.+)|robots\.txt\b|humans\.txt\b|favicon\.ico\b)/.test(req.url)) {
			setSecurityHeaders(res);
			req.addListener("end",function(){
				req.url = "/web" + req.url;
				static_files.serve(req,res);
			});
			req.resume();
		}
		// a recognized path for a full-page request?
		else if ((url = Pages.recognize(req.url))) {
			setSecurityHeaders(res);
			doGetPage(req,res,url);
		}
		// not a recognized route
		else {
			return false;
		}
	}
	else if (req.method === "POST") {
		if (req.url === "/user/verify") {
			setSecurityHeaders(res);
			doVerifyUser(req,res);
		}
		else if (req.url === "/session/verify") {
			setSecurityHeaders(res);
			doVerifySession(req,res);
		}
		else if (req.url === "/logout/do") {
			setSecurityHeaders(res);
			doLogout(req,res);
		}
		else if (req.url === "/profile/get") {
			setSecurityHeaders(res);
			doGetProfile(req,res);
		}
		else if (req.url === "/profile/update") {
			setSecurityHeaders(res);
			doUpdateProfile(req,res);
		}
		else if (req.url === "/profile/update-email") {
			setSecurityHeaders(res);
			doUpdateEmail(req,res);
		}
		// not a recognized route
		else {
			return false;
		}
	}
	// not a recognized route
	else {
		return false;
	}
}

function doGetPage(req,res,url) {
	var page_data, sq;

	setSecurityHeaders(res);

	page_data = {
		bootstrapper: "/js/" + (PROD ? "" : "") + "load.js",
		logged_in: !!req.session_id
	};

	sq = ASQ(page_data);

	if (~SESSION_REQUIRED.indexOf(url)) {
		// valid session?
		if (req.session_id) {
			if (url === "/profile") {
				sq
				.val(sessions[req.session_id].user_id)
				.seq(retrieveProfile)
				.val(function(profileData){
					// copy profile data over
					for (var key in profileData) {
						page_data[key] = profileData[key];
					}
					return page_data;
				});
			}
		}
		// required login session missing
		else {
			res.writeHead(301, { Location: YDKJS_SITE });
			res.end();
			return;
		}
	}

	sq
	.val(function(data){
		var html = Pages.getPageHTML(url,data);

		res.writeHead(200,{ "Content-type": "text/html; charset=UTF-8" });
		res.end(html);
	});
}

function checkSessionID(sessionID,updateTimestamp) {
	updateTimestamp = (updateTimestamp !== false);
	if (sessionID && sessionID in sessions) {
		if (updateTimestamp) {
			sessions[sessionID].timestamp = Date.now();
		}
		return true;
	}
	return false;
}

function validateSession(sessionID) {
	return ASQ()
	.val(function(){
		if (checkSessionID(sessionID)) {
			return sessionID;
		}
		else {
			throw "Session invalid";
		}
	});
}

function doVerifySession(req,res) {
	collectPostData(req)
	.val(function(data){
		setupJSONResponse(res);
		return data;
	})
	.val(processJSONPostData)
	.val(function(sessionData){
		return sessionData.session_id;
	})
	.seq(validateSession)
	.val(function(sessionID){
		res.end(JSON.stringify({
			session_id: sessionID
		}));
	})
	.or(function(err){
		res.end(jsonError(err));
	});
}

function doVerifyUser(req,res) {
	collectPostData(req)
	.val(function(data){
		setupJSONResponse(res);
		return data;
	})
	.val(processJSONPostData)
	.val(function(userIDData){
		// format inbound data
		Format.formatProfileInfo(userIDData);

		return ASQ.messages(
			userIDData.user_id,
			userIDData.profile_email
		);
	})
	.seq(matchUserAndEmail)
	.val(startSession)
	.val(function(sessionID){
		res.end(JSON.stringify({
			success: sessionID
		}));
	})
	.or(function(err){
		res.end(jsonError(err));
	});
}

function matchUserAndEmail(userID,email) {
	var email_hash = sha1(email);

	return getFromDB(
		/*key=*/"email:" + email_hash,
		/*fields=*/[ "user_id" ]
	)
	.val(function(userData){
		if (userData.user_id && userData.user_id === userID) {
			return userID;
		}
		else {
			throw "Email did not match";
		}
	});
}

function doLogout(req,res) {
	collectPostData(req)
	.val(processJSONPostData)
	.val(function(logoutData){
		delete sessions[logoutData.session_id];

		res.writeHead(204);
		res.end();
	})
	.or(function(err){
		res.end(jsonError(err));
	});
}

function doGetProfile(req,res) {
	collectPostData(req)
	.val(processJSONPostData)
	.val(function(sessionData){
		return sessionData.session_id;
	})
	.seq(validateSession)
	.val(function(sessionID){
		return sessions[sessionID].user_id;
	})
	.seq(retrieveProfile)
	.val(function(profileData){
		res.end(JSON.stringify({
			profile: profileData
		}));
	})
	.or(function(err){
		res.end(jsonError(err));
	});
}

function retrieveProfile(userID) {
	return ASQ()
	.seq(
		getFromDB(
			/*key=*/"user:" + userID,
			/*fields=*/[
				"pick_shirt", "pick_game", "pick_shipping", "email",
				"name", "twitter", "phone", "credit", "pledge_amount",
				"reward_level", "shirt_size", "shipping"
			]
		)
	)
	.val(function(profileData){
		return {
			pick_shirt: (profileData.pick_shirt === "true"),
			pick_game: (profileData.pick_game === "true"),
			pick_shipping: (profileData.pick_shipping === "true"),
			profile_email: profileData.email || "",
			profile_name: profileData.name || "",
			profile_twitter: profileData.twitter || "",
			profile_phone: profileData.phone || "",
			profile_credit: profileData.credit || "",
			profile_pledge_amount: profileData.pledge_amount || "0.00",
			profile_reward_level: profileData.reward_level || "n/a",
			profile_shirt_size: profileData.shirt_size || "",
			profile_shipping: profileData.shipping ?
				profileData.shipping :
				{
					domestic: true,
					address: "",
					city: "",
					state: "",
					zip: ""
				}
		};
	});
}

function doUpdateProfile(req,res) {
	collectPostData(req)
	.val(processJSONPostData)
	.seq(function(profileData){
		return ASQ(profileData.session_id)
		.seq(validateSession)
		.val(function(sessionID){
			return ASQ.messages(
				sessions[sessionID].user_id,
				profileData
			);
		});
	})
	.val(function(userID,profileData){
		// validate inbound data
		var res = Validate.checkProfileInfo(profileData);

		if (res !== true) {
			throw res;
		}

		// format inbound data
		Format.formatProfileInfo(profileData);

		return ASQ.messages(userID,profileData);
	})
	.seq(function(userID,profileData){
		return putIntoDB(
			/*key=*/"user:" + userID,
			/*vals=*/{
				name: profileData.profile_name || "",
				twitter: profileData.profile_twitter || "",
				phone: profileData.profile_phone || "",
				credit: profileData.profile_credit || "",
				shirt_size: profileData.profile_shirt_size || "",
				shipping: profileData.profile_shipping ?
					"json:" + JSON.stringify(profileData.profile_shipping) :
					""
			}
		)
		.val(function(ret){
			if (ret !== "OK") {
				throw "Profile update failed";
			}
		});
	})
	.val(function(){
		res.end(JSON.stringify({
			success: true
		}));
	})
	.or(function(err){
		res.end(jsonError(err));
	});
}

function doUpdateEmail(req,res) {
	collectPostData(req)
	.val(processJSONPostData)
	.seq(function(profileData){
		return ASQ(profileData.session_id)
		.seq(validateSession)
		.val(function(sessionID){
			return ASQ.messages(
				sessions[sessionID].user_id,
				profileData
			);
		});
	})
	.val(function(userID,profileData){
		// validate inbound data
		var res = Validate.checkProfileInfo(profileData);

		if (res !== true) {
			throw res;
		}

		// format inbound data
		Format.formatProfileInfo(profileData);

		return ASQ.messages(userID,profileData);
	})
	.seq(function(userID,profileData){
		return getFromDB(
			/*key=*/"user:" + userID,
			/*fields=*/[ "email" ]
		)
		.val(function(userData){
			profileData.old_email = userData.email;
			return ASQ.messages(userID,profileData);
		});
	})
	.val(function(userID,profileData){
		// reject if no change to email address
		if (profileData.old_email === profileData.profile_email) {
			throw "Email must be different";
		}
		return ASQ.messages(userID,profileData);
	})
	.seq(function(userID,profileData){
		var old_email_hash = sha1(profileData.old_email),
			new_email_hash = sha1(profileData.profile_email)
		;

		return ASQ()
		.val(function(){
			// start up a DB transaction
			DB_store.multi();
		})
		.waterfall(
			function(done){
				// update user record
				putIntoDB(
					/*key=*/"user:" + userID,
					/*vals=*/{
						"email": profileData.profile_email || ""
					}
				)
				.pipe(done);
			},
			function(done){
				// create new email-to-user relation record
				putIntoDB(
					/*key=*/"email:" + new_email_hash,
					/*vals=*/{
						user_id: userID
					}
				)
				.pipe(done);
			},
			function(done){
				// remove old email-to-user relation record
				removeFromDB("email:" + old_email_hash)
				.pipe(done);
			}
		)
		.val(function(ret1,ret2,ret3){
			if (!(
				ret1 === "QUEUED" &&
				ret2 === "QUEUED" &&
				ret3 === "QUEUED"
			)) {
				throw "Queing update failed: " + JSON.stringify(Array.prototype.slice.call(arguments));
			}
		})
		.promise(function(){
			return DB_store.exec();
		})
		.val(function(ret){
			if (!(
				Array.isArray(ret) &&
				ret[0] === "OK" &&
				ret[1] === "OK" &&
				ret[2] === 1
			)) {
				throw "Email update failed: " + JSON.stringify(Array.prototype.slice.call(arguments));
			}
		});
	})
	.val(function(){
		res.end(JSON.stringify({
			success: true
		}));
	})
	.or(function(err){
		res.end(jsonError(err));
	});
}

function startSession(userID) {
	var sess_id;

	// find a new session-ID
	do {
		sess_id = Util.guid();
	} while (sess_id in sessions);

	// assign the user to the session
	sessions[sess_id] = {
		user_id: userID,
		timestamp: Date.now()
	};

	return sess_id;
}

function expireSessions() {
	Object.keys(sessions).forEach(function(sessID){
		if (sessions[sessID].timestamp < (Date.now() - SESSION_LIFETIME)) {
			delete sessions[sessID];
		}
	});
}

function setSecurityHeaders(res) {
	// From: https://developer.mozilla.org/en-US/docs/Security/CSP/Introducing_Content_Security_Policy
	res.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-eval' *snapsby.com ajax.googleapis.com ssl.google-analytics.com");

	// From: https://developer.mozilla.org/en-US/docs/Security/HTTP_Strict_Transport_Security
	res.setHeader("Strict-Transport-Security","max-age=" + 1E9 + "; includeSubdomains");
}

function loadTemplates(file) {
	var cache_entry;

	if (/Tmpls\.js$/.test(file)) {
		cache_entry = require.resolve(file);

		// templates already loaded into cache?
		if (require.cache[cache_entry]) {
			NOTICE("templates","Reloaded.");

			// clear the templates-module from the require cache
			delete require.cache[cache_entry];

			// clear out the grips collection cache
			Object.keys(grips.collections).forEach(function(key){
				delete grips.collections[key];
			});
		}
		else {
			NOTICE("templates","Loaded.");
		}

		// load the templates-module and initialize it
		Tmpls = require(file);
		Tmpls.grips = grips;
		Tmpls.init();
	}
}


// *******************
// DB Management

// HMSET: returns "OK" on success, some other status/error on failure
function putIntoDB(key,vals) {
	var args = Array.prototype.slice.call(arguments);

	return ASQ()
	.promise(function(done){
		// multiple-statement save transaction?
		if (Array.isArray(key)) {
			DB_store.multi();

			args.forEach(function(arg){
				var key = arg[0], vals = arg[1];
				DB_store.hmset(key,vals);
			});

			return DB_store.exec();
		}
		// otherwise, single statement save
		else {
			return DB_store.hmset(key,vals);
		}
	});
}

// HSETNX: returns 1 on success, 0 on failure
function putUniqueIntoDB(key,field,val) {
	return ASQ()
	.promise(
		DB_store.hsetnx(key,field,val)
	);
}

function getFromDB(key,fields) {
	var sq = ASQ();

	if (fields) {
		if (!Array.isArray(fields)) {
			fields = [fields];
		}

		sq
		.promise(
			DB_store.hmget.apply(DB_store,[key].concat(fields))
		)
		.val(function(vals){
			var tmp;
			if (Array.isArray(vals)) {
				tmp = {};
				vals.forEach(function(val,idx){
					tmp[fields[idx]] = val;
				});
				vals = tmp;
			}
			return vals;
		});
	}
	else {
		sq
		.promise(
			DB_store.hgetall(key)
		);
	}

	// see if we need to JSON.parse() the values
	return sq.val(function(vals){
		vals = vals || {};
		Object.keys(vals).forEach(function(idx){
			if (typeof vals[idx] === "string" && /^json:/.test(vals[idx])) {
				try { vals[idx] = JSON.parse(vals[idx].substr(5)); } catch (err) { }
			}
			else if (vals[idx] === null) {
				delete vals[idx];
			}
		});
		return vals;
	});
}

// DEL/HDEL: returns {INT} number of deleted fields
function removeFromDB(key,fields) {
	if (fields) {
		if (!Array.isArray(fields)) {
			fields = [fields];
		}

		return ASQ()
		.promise(
			DB_store
			.hdel.apply(
				DB_store,
				[key].concat(fields)
			)
		);
	}
	else {
		return ASQ()
		.promise(
			DB_store.del(key)
		);
	}
}


// *******************
// Logging

function jsonError(err) {
	if (typeof err === "object") {
		if ("stack" in err) err = err.stack + "";
		else if ("error" in err) {
			if ("stack" in err.error) err = err.error.stack + "";
			else err = err.error + "";
		}
	}

	try {
		err = JSON.stringify({ error: err });
	}
	catch (e) {
		err = "{\"error\":\"" + (err + "").replace("\"","\\\"") + "\"}";
	}

	return err;
}

function logMessage(msg,returnVal) {
	var d = new Date();
	msg = "[" + d.toLocaleString() + "] " + msg;
	if (!!returnVal) {
		return msg;
	}
	else {
		console.log(msg);
	}
}

function NOTICE(location,msg,returnVal) {
	return logMessage("NOTICE(" + location + "): " + msg,!!returnVal);
}

function ERROR(location,msg,returnVal) {
	return logMessage("ERROR(" + location + "): " + msg,!!returnVal);
}


var PROD = (process.env.NODE_ENV === "production"),

	http = require("http"),
	httpserv = http.createServer(handler),
	node_static = require("node-static"),
	ASQ = require("asynquence"),
	redis = require("then-redis"),
	path = require("path"),
	url_parser = require("url"),
	watch = require("watch"),
	cookie = require("cookie"),
	sha1 = require("sha1"),
	grips = require("grips")[
		// either pull in production or debug of grips engine
		PROD ? "grips" : "debug"
	],

	Tmpls,
	Pages = require(path.join(__dirname,"web","js","Pages.js")),
	Validate = require(path.join(__dirname,"web","js","Validate.js")),
	Format = require(path.join(__dirname,"web","js","Format.js")),
	Util = require(path.join(__dirname,"web","js","Util.js")),

	// pull in "secret" config settings
	secret = require(path.join(__dirname,"secret.js")),

	static_file_opts = {
		serverInfo: secret.SERVER_NAME,
		cache: PROD ?
			secret.PROD_STATIC_FILE_CACHE_LENGTH :
			secret.DEV_STATIC_FILE_CACHE_LENGTH,
		gzip: PROD
	},
	static_files = new node_static.Server(__dirname, static_file_opts),

	DB_store,
	sessions = {},
	expire_sessions_interval,

	// config constants
	INTERNAL_SERVER_ADDR = secret.INTERNAL_SERVER_ADDR,
	INTERNAL_SERVER_PORT = secret.INTERNAL_SERVER_PORT,
	PUBLIC_SERVER_ADDR = secret.PUBLIC_SERVER_ADDR,
	PUBLIC_SERVER_PORT = secret.PUBLIC_SERVER_PORT,

	REDIS_SERVER_ADDR = secret.REDIS_SERVER_ADDR,
	REDIS_SERVER_PORT = secret.REDIS_SERVER_PORT,
	REDIS_SERVER_DB = secret.REDIS_SERVER_DB,

	CORS_GET_HEADERS = secret.CORS_GET_HEADERS,
	CORS_POST_HEADERS = secret.CORS_POST_HEADERS,

	SESSION_LIFETIME = 1000 * 60 * 30,
	SESSION_EXPIRATION_INTERVAL = 1000 * 60 * 5,

	YDKJS_SITE = "..",

	SESSION_REQUIRED = ["/profile"],

	ø = Object.create(null)
;


// extend asynquence with contrib plugins
require("asynquence-contrib");


// share grips references
Pages.grips = grips;


// initialize all the templates
loadTemplates(path.join(__dirname,"web","js","Tmpls.js"));


// watch for an updated templates-bundle to reload it
watch.createMonitor(
	/*root=*/path.join(__dirname,"web","js"),
	/*options=*/{
		filter: function(file) {
			// only monitor the template-bundle "Tmpls.js"
			return !/Tmpls\.js$/.test(file);
		}
	},
	/*handler=*/function(monitor) {
		monitor.on("created",loadTemplates);
		monitor.on("changed",loadTemplates);
	}
);


// connect redis database
redis.connect({
	host: REDIS_SERVER_ADDR,
	port: REDIS_SERVER_PORT,
	database: REDIS_SERVER_DB,
	timeout: 1000 * 60 * 3
})
.then(
	// connection success
	function(db){
		DB_store = db;

		// spin up the HTTP server
		httpserv.listen(INTERNAL_SERVER_PORT, INTERNAL_SERVER_ADDR);
	},
	// connection error
	function(err){
		ERROR("redis.connect", "redis connection failed: " + jsonError(err));
	}
);

expire_sessions_interval = setInterval(expireSessions,SESSION_EXPIRATION_INTERVAL);
