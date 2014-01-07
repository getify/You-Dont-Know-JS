function generateUser(userData) {
	var email_hash = sha1(userData["Email"]);

	return ASQ()
	.seq(
		putUniqueIntoDB(
			/*key=*/"email:" + email_hash,
			/*field=*/"user_id",
			/*val=*/""
		)
		.val(function(ret){
			// email registration failed?
			if (ret !== 1) {
				throw "Email already registered";
			}
		})
	)
	.until(function(done){
		var user_id = Util.guid();

		putUniqueIntoDB(
			/*key=*/"user:" + user_id,
			/*field=*/"email",
			/*val=*/userData["Email"]
		)
		.val(function(ret){
			// user-ID generation/insertion succeeded!
			if (ret === 1) {
				done(user_id);
			}
			// retry
			else {
				done.fail();
			}
		})
		.or(function(){
			removeFromDB(
				/*key=*/"email:" + email_hash
			);
			done.break("UserID generation failed");
		});
	})
	.then(function(done,userID){
		putIntoDB(
			/*key=*/"email:" + email_hash,
			/*vals=*/{ "user_id": userID }
		)
		.val(function(){
			done(userID);
		})
		.or(function(err){
			removeFromDB(
				/*key=*/"email:" + email_hash
			);
			removeFromDB(
				/*key=*/"user:" + userID
			);
			done.fail("Email-to-UserID association failed; " + err);
		});
	})
	.seq(function(userID){
		return putIntoDB(
			/*key=*/"user:" + userID,
			/*vals=*/{
				name: userData["Backer Name"] || "",
				credit: userData["Backer Name"] || "",
				pick_shirt: userData["pick_shirt"] || "false",
				pick_game: userData["pick_game"] || "false",
				pick_shipping: userData["pick_shipping"] || "false",
				pledge_amount: userData["Pledge Amount"] || "",
				reward_level: userData["reward_level"] || "",
				shipping: userData["shipping"] || ""
			}
		)
		.val(function(ret){
			// user data update failed?
			if (ret !== "OK") {
				throw "User data update failed.";
			}
		})
		.val(userID,userData);
	});
}

function setRewardLevelFlags(level,record) {
	switch (level) {
		case "reward=5":
			record["reward_level"] = "$5: Cheerleader(x)";
			break;
		case "reward=10":
			record["reward_level"] = "$10: EbookMe(1)";
			break;
		case "reward=15":
			record["reward_level"] = "$15: UpgradeMe(1)";
			record["pick_shipping"] = "true";
			record["pick_shirt"] = "true";
			break;
		case "reward=25":
			record["reward_level"] = "$25: EbookMe(x)";
			break;
		case "reward=30":
			record["reward_level"] = "$30: UpgradeMe(1)";
			record["pick_shipping"] = "true";
			record["pick_shirt"] = "true";
			break;
		case "reward=31":
			record["reward_level"] = "$31: UpgradeMe(1)";
			record["pick_shipping"] = "true";
			record["pick_shirt"] = "true";
			break;
		case "reward=35 1":
			record["reward_level"] = "$35: EbookMe(x) + BookMe(1)";
			record["pick_shipping"] = "true";
			break;
		case "reward=35 2":
			record["reward_level"] = "$35: EbookMe(x) + TshirtMe(1)";
			record["pick_shipping"] = "true";
			record["pick_shirt"] = "true";
			break;
		case "reward=38":
			record["reward_level"] = "$38: AvatarMe(1) + EbookMe(x)";
			record["pick_game"] = "true";
			break;
		case "reward=48":
			record["reward_level"] = "$48: CharacterMe(1) + EbookMe(x)";
			record["pick_game"] = "true";
			break;
		case "reward=50":
			record["reward_level"] = "$50: EbookMe(x) + BookMe(1) + TshirtMe(1)";
			record["pick_shipping"] = "true";
			record["pick_shirt"] = "true";
			break;
		case "reward=68":
			record["reward_level"] = "$68: RoomMe(1) + EbookMe(x)";
			record["pick_game"] = "true";
			break;
		case "reward=75":
			record["reward_level"] = "$75: EbookMe(x) + BookMe(x)";
			record["pick_shipping"] = "true";
			break;
		case "reward=85":
			record["reward_level"] = "$85: EbookMe(x) + BookMe(x) + TshirtMe(1)";
			record["pick_shipping"] = "true";
			record["pick_shirt"] = "true";
			break;
		case "reward=100":
			record["reward_level"] = "$100: EbookMe(x * 10)";
			break;
		case "reward=150":
			record["reward_level"] = "$150: EbookMe(x * 10) + BookMe(x)";
			record["pick_shipping"] = "true";
			break;
		default:
			record["reward_level"] = "-none-";
	}
}

function emailUser(userID,userData) {
	return ASQ(function(done){
		var email_subject = grips.render("email-invite#subject",{
			name: userData["Backer Name"]
		});
		var email_body = grips.render("email-invite#body",{
			name: userData["Backer Name"],
			email: userData["Email"],
			user_id: userID
		});

		smtpTransport.sendMail({
			from: "'You Don't Know JS' Kickstarter <getify+ydkjs@gmail.com>",
			to: userData["Email"],
			subject: email_subject,
			text: email_body
		},function(err,res){
			if (err) {
				done.fail("Error emailing " + userData["Email"] +": " + err);
			}
			else {
				console.log("Email sent: " + userData["Email"]);
				done();
			}
		});
	});
}

function reEmailUser(emailAddress) {
	var email_hash = sha1(emailAddress);

	return getFromDB(
		/*key=*/"email:" + email_hash,
		/*fields=*/"user_id"
	)
	.seq(function(emailData){
		return getFromDB(
			/*key=*/"user:" + emailData.user_id,
			/*fields=*/["name","email"]
		)
		.val(function(userData){
			return ASQ.messages(
				/*userID=*/emailData.user_id,
				/*userData=*/{
					"Backer Name": userData.name,
					"Email": userData.email
				}
			);
		});
	})
	.seq(emailUser);
}

function runGeneration() {
	getCSVRecords(path.join(__dirname,"csv"))
	.seq(function(rewardLevels){
		var steps = [];

		Object.keys(rewardLevels).forEach(function(level){
			steps = steps.concat(
				rewardLevels[level].map(function(record){
					setRewardLevelFlags(level,record);
					record["Email"] = record["Email"].toLowerCase().substr(0,100);
					record["Pledge Amount"] = record["Pledge Amount"].replace(/^\$(\d+\.\d+).*$/,"$1");

					return function __step__(done){
						generateUser(record)
						.pipe(done);
					};
				})
			);
		});

		return ASQ()
		.waterfall.apply(ø,steps);
	})
	.seq(function(){
		var segments = Array.prototype.slice.call(arguments)
		.map(function(arg){
			return function __segment__(done) {
				emailUser(arg[0],arg[1])
				.pipe(done);
			};
		});

		return ASQ()
		.gate.apply(ø,segments)
		.val(function(){
			DB_store.connection.end();
			smtpTransport.close();
			console.log("All done");
		});
	})
	.or(function(err){
		console.log(err.stack || err);
	});
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
// CSV Import

function getCSVRecords(dir) {

	function getFileData(filename) {
		return ASQ(function(done){
			var st = fs.statSync(filename), records = [],
				field_names
			;

			if (st.isFile()) {
				csv()
				.from.stream(fs.createReadStream(filename))
				.on("record",function(row) {
					if (!field_names) {
						field_names = row;
					}
					else {
						records.push(
							row.reduce(function(record,val,idx){
								record[field_names[idx]] = val;
								return record;
							},{})
						);
					}
				})
				.on("end",function(){
					done(filename,records);
				})
				.on("error",done.fail);
			}
			else {
				done();
			}
		});
	}

	return ASQ()
	.gate.apply(ø,
		fs.readdirSync(dir)
		.map(function(file){
			return function __segment__(done) {
				getFileData(path.join(__dirname,"csv",file))
				.pipe(done);
			};
		})
	)
	.val(function(){
		return Array.prototype.slice.call(arguments)
		.reduce(function(records,fileData){
			records[
				fileData[0]
				.replace(/^.*\/\$(\d+)\.00(.*)?\.csv$/,"reward=$1$2")
			] = fileData[1];
			return records;
		},{});
	});
}


// *******************
// Logging

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



var ASQ = require("asynquence"),
	redis = require("then-redis"),
	path = require("path"),
	sha1 = require("sha1"),
	csv = require("csv"),
	fs = require("fs"),
	grips = require("grips").debug,
	nodemailer = require("nodemailer"),
	smtpTransport = nodemailer.createTransport("SMTP",{
		host: "..",
		port: 25,
		name: ".."
	}),

	Util = require(path.join(__dirname,"web","js","Util.js")),

	// pull in "secret" config settings
	secret = require(path.join(__dirname,"secret.js")),

	DB_store,

	// config constants
	REDIS_SERVER_ADDR = secret.REDIS_SERVER_ADDR,
	REDIS_SERVER_PORT = secret.REDIS_SERVER_PORT,
	REDIS_SERVER_DB = secret.REDIS_SERVER_DB,

	YDKJS_SITE = "..",

	ø = Object.create(null),

	email_invite_template = fs.readFileSync(path.join(__dirname,"email-invite.grips.html"),{ encoding: "utf8" })
;


// compile email-invite template
grips.compileCollection(
	/*source=*/email_invite_template,
	/*collectionID=*/"email-invite",
	/*initialize=*/true
);


// include asynquence contrib plugins
require("asynquence-contrib");


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

		runGeneration();

		/*reEmailUser("..")
		.val(function(){
			DB_store.connection.end();
			smtpTransport.close();
		})
		.or(function(){
			DB_store.connection.end();
			smtpTransport.close();
		});*/
	},
	// connection error
	function(err){
		ERROR("redis.connect", "redis connection failed: " + jsonError(err));
	}
);
