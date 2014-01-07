(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition();
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Format",this || {},function definition(name,context) {
	"use strict";

	function trim(str) {
		return str.replace(/^\s+/,"").replace(/\s+$/,"");
	}

	function formatLogin(data) {
		// map the login data fields to profile fields
		if ("login_email" in data) {
			data.profile_email = data.login_email;
			delete data.login_email;
		}

		formatProfileInfo(data);
	}

	function formatProfileInfo(data) {
		if ("profile_email" in data) {
			data.profile_email = trim(data.profile_email.toLowerCase());

			if (data.profile_email.length > 100) {
				data.profile_email = data.profile_email.substr(0,100);
				if (context.Notify) {
					Notify.warn("Email must be 100 or less characters");
				}
			}
		}
		if ("profile_name" in data) {
			data.profile_name = trim(data.profile_name);

			if (data.profile_name.length > 50) {
				data.profile_name = data.profile_name.substr(0,50);
				if (context.Notify) {
					Notify.warn("Name must be 50 or less characters");
				}
			}
		}
		if ("profile_twitter" in data) {
			data.profile_twitter = trim(data.profile_twitter);

			if (data.profile_twitter.length > 15) {
				data.profile_twitter = data.profile_twitter.substr(0,15);
				if (context.Notify) {
					Notify.warn("Twitter account must be 15 or less characters");
				}
			}
		}
		if ("profile_phone" in data) {
			data.profile_phone = trim(data.profile_phone.replace(/[^\d\+]/g,""));

			if (data.profile_phone.length > 15) {
				data.profile_phone = data.profile_phone.substr(0,15);
				if (context.Notify) {
					Notify.warn("Phone must be 15 or less numbers");
				}
			}
		}
		if ("profile_credit" in data) {
			data.profile_credit = trim(data.profile_credit);

			if (data.profile_credit.length > 25) {
				data.profile_credit = data.profile_credit.substr(0,25);
				if (context.Notify) {
					Notify.warn("Listing must be 25 or less numbers");
				}
			}
		}
		if ("profile_shipping" in data) {
			if ("address" in data.profile_shipping) {
				data.profile_shipping.address = trim(data.profile_shipping.address);

				if (data.profile_shipping.address.length > 150) {
					data.profile_shipping.address = data.profile_shipping.address.substr(0,150);
					if (context.Notify) {
						Notify.warn("Shipping address must be 150 or less characters");
					}
				}
			}
			if (data.profile_shipping.domestic) {
				if ("city" in data.profile_shipping) {
					data.profile_shipping.city = trim(data.profile_shipping.city);

					if (data.profile_shipping.city.length > 50) {
						data.profile_shipping.city = data.profile_shipping.city.substr(0,50);
						if (context.Notify) {
							Notify.warn("Shipping city must be 50 or less characters");
						}
					}
				}
				if ("zip" in data.profile_shipping) {
					data.profile_shipping.zip = trim(data.profile_shipping.zip.replace(/[^\d\-]/g,""));

					if (data.profile_shipping.zip.length > 10) {
						data.profile_shipping.city = data.profile_shipping.city.substr(0,50);
						if (context.Notify) {
							Notify.warn("Shipping zip must be 10 or less characters");
						}
					}
				}
			}
			else {
				data.profile_shipping.city = data.profile_shipping.state = data.profile_shipping.zip = null;
			}
		}
	}

	var public_api;

	public_api = {
		formatLogin: formatLogin,
		formatProfileInfo: formatProfileInfo
	};

	return public_api;
});
