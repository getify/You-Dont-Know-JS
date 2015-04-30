(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition();
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Validate",this || {},function definition(name,context) {
	"use strict";

	function checkLogin(data) {
		// clone data object
		data = JSON.parse(JSON.stringify(data));

		if (!data.user_id) {
			return "Must include the User ID as provided to you via email";
		}
		if (!/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}/.test(data.user_id)) {
			return "User ID must be valid and as provided to you via email";
		}

		// map the login data fields to profile fields
		if ("login_email" in data) {
			data.profile_email = data.login_email;
			delete data.login_email;
		}

		return checkProfileInfo(data);
	}

	function checkProfileInfo(data) {
		if ("profile_email" in data) {
			if (data.profile_email.length < 5) {
				return "Email must be 5+ characters";
			}
			if (!/^[^@\s]+@[^@\s.]+\.[^@\s]/.test(data.profile_email)) {
				return "Email must be well-formed (foo@bar.baz)";
			}
		}
		if ("profile_name" in data) {
			if (data.profile_name != null && data.profile_name.length < 3) {
				return "Name must be 3+ characters";
			}
		}
		// optional
		if ("profile_twitter" in data && data.profile_twitter) {
			if (/[^a-zA-Z0-9\-_]/.test(data.profile_twitter)) {
				return "Twitter account must be well-formed";
			}
		}
		// optional
		if ("profile_phone" in data && data.profile_phone) {
			if (data.profile_phone.length < 6) {
				return "Phone number must be 6+ numbers";
			}
			if (/[^\d\-\(\)\+\s\.]/.test(data.profile_phone)) {
				return "Phone number must be numeric only";
			}
		}
		if ("profile_credit" in data) {
			if (data.profile_credit != null && data.profile_credit.length < 3) {
				return "Listing must be 3+ characters";
			}
		}
		if ("profile_shirt_size" in data) {
			if (!~["S","M","L","XL","2XL","3XL","4XL","5XL"]
				.indexOf(data.profile_shirt_size)
			) {
				return "Shirt size must be a valid option";
			}
		}
		if ("profile_shipping" in data) {
			if ("address" in data.profile_shipping) {
				if (data.profile_shipping.address.length < 10) {
					return "Shipping address must be valid";
				}
			}
			if (data.profile_shipping.domestic) {
				if ("city" in data.profile_shipping) {
					if (data.profile_shipping.city.length < 2) {
						return "Shipping city must be 2+ characters";
					}
				}
				else {
					return "Shipping city must be valid";
				}
				if ("state" in data.profile_shipping) {
					if (!~["AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]
						.indexOf(data.profile_shipping.state)
					) {
						return "Shipping state must be valid";
					}
				}
				else {
					return "Shipping state must be valid";
				}
				if ("zip" in data.profile_shipping) {
					if (data.profile_shipping.zip.length < 5) {
						return "Shipping ZIP must be 5+ characters";
					}
					if (/[^\d\-]/.test(data.profile_shipping.zip)) {
						return "Shipping ZIP must be numeric only";
					}
					if (!/^\d{5}(?:-\d{4})?$/.test(data.profile_shipping.zip)) {
						return "Shipping ZIP must be in ZIP/ZIP+4 format (12345 or 12345-6789)";
					}
				}
				else {
					return "Shipping ZIP must be valid";
				}
			}
		}

		return true;
	}

	var public_api;

	public_api = {
		checkLogin: checkLogin,
		checkProfileInfo: checkProfileInfo
	};

	return public_api;
});
