(function(global,Pages){
	"use strict";

	function doUpdate() {
		var res, data;

		// if site is disabled, don't proceed
		if (Pages.disabled) {
			Notify.error("Not allowed");
			return;
		}

		data = {
			session_id: Util.session_id,
			profile_name: $profile_name.val(),
			profile_twitter: $profile_twitter.val(),
			profile_phone: $profile_phone.val(),
			profile_credit: $profile_credit.val()
		};

		if ($profile_shirt_size.length > 0) {
			data.profile_shirt_size = $profile_shirt_size.val();
		}

		if ($profile_shipping_domestic.length > 0) {
			data.profile_shipping = {
				domestic: $profile_shipping_domestic.is(":checked"),
				address: $profile_shipping_address.val()
			};

			// save additional domestic shipping fields?
			if (data.profile_shipping.domestic) {
				data.profile_shipping.city = $profile_shipping_city.val();
				data.profile_shipping.state = $profile_shipping_state.val();
				data.profile_shipping.zip = $profile_shipping_zip.val();
			}
		}

		// first validate the entered data
		res = Validate.checkProfileInfo(data);

		if (res !== true) {
			Notify.error(res);
			return;
		}

		Notify.reset();
		Notify.notice("Updating profile, please wait...");

		// make sure the data is formatted correctly
		Format.formatProfileInfo(data);

		// save profile info
		$.ajax({
			type: "POST",
			url: "/profile/update",
			data: JSON.stringify(data),
			processData: false,
			contentType: "application/javascript; charset=UTF-8",
			dataType: "json"
		})
		.success(function(res) {
			if (res.success) {
				Notify.reset();
				Notify.notice("Profile updated");
			}
			else {
				Notify.reset();
				Notify.error("Update failed: " + (res.error || res));
			}
		})
		.error(function(jqx,err,errObj){
			Notify.reset();
			Notify.error("Update failed: " + err + (errObj ? "; " + JSON.stringify(errObj.stack || errObj) : ""));
		});
	}

	function doUpdateEmail() {
		var res, data;

		// if site is disabled, don't proceed
		if (Pages.disabled) {
			Notify.error("Not allowed");
			return;
		}

		data = {
			session_id: Util.session_id,
			profile_email: $("#new_email").val()
		};

		// first validate the entered data
		res = Validate.checkProfileInfo(data);

		if (res !== true) {
			Notify.error(res);
			return;
		}

		// make sure the data is formatted correctly
		Format.formatProfileInfo(data);

		if (data.profile_email === current_email) {
			Notify.error("Email must be different");
			return;
		}

		Notify.reset();
		Notify.notice("Updating profile, please wait...");

		// save profile info
		$.ajax({
			type: "POST",
			url: "/profile/update-email",
			data: JSON.stringify(data),
			processData: false,
			contentType: "application/javascript; charset=UTF-8",
			dataType: "json"
		})
		.success(function(res) {
			hideEmailModal();

			if (res.success) {
				// refresh the profile view after the email update
				doFetch();
			}
			else {
				$("#new_email").val("");
				Notify.reset();
				Notify.error("Update failed: " + (res.error || res));
			}
		})
		.error(function(jqx,err,errObj){
			hideEmailModal();
			$("#new_email").val("");
			Notify.reset();
			Notify.error("Update failed: " + err + (errObj ? "; " + JSON.stringify(errObj.stack || errObj) : ""));
		});
	}

	function doFetch() {
		var data = {
			session_id: Util.session_id
		};

		// fetch profile info
		Notify.reset();
		Notify.notice("Loading profile, please wait...");
		$.ajax({
			type: "POST",
			url: "/profile/get",
			data: JSON.stringify(data),
			processData: false,
			contentType: "application/javascript; charset=UTF-8",
			dataType: "json"
		})
		.success(function(res) {
			var html;

			Notify.reset();
			if (res.profile && res.profile.profile_email) {
				teardown();
				html = Pages.getPageContentHTML("/profile",res.profile);
				$("#content").replaceWith(html);
				current_email = res.profile.profile_email;
				init();
			}
			else {
				Notify.error("Profile load failed: " + (res.error || res));
			}
		})
		.error(function(jqx,err,errObj){
			Notify.reset();
			Notify.error("Profile load failed: " + err + (errObj ? "; " + JSON.stringify(errObj.stack || errObj) : ""));
		});
	}

	function swapShippingType() {
		var cur_address = $profile_shipping_address.val(), html;

		if ($profile_shipping_domestic.is(":checked")) {
			html = Pages.getSnippetHTML("/profile#domestic_shipping",{
				profile_shipping: {
					domestic: true,
					address: cur_address,
					city: "",
					state: "",
					zip: ""
				}
			});

			teardown();
			$("#shipping_info").replaceWith(html);
			init();
		}
		else {
			html = Pages.getSnippetHTML("/profile#international_shipping",{
				profile_shipping: {
					domestic: false,
					address: cur_address
				}
			});

			teardown();
			$("#shipping_info").replaceWith(html);
			init();
		}
	}

	function init(){
		if ($("#content").is(".loading")) {
			doFetch();
		}
		else {
			$profile_email = $("#profile_email");
			$modify_email = $("#modify_email");
			$profile_name = $("#profile_name");
			$profile_twitter = $("#profile_twitter");
			$profile_phone = $("#profile_phone");
			$profile_credit = $("#profile_credit");
			$profile_shirt_size = $("#profile_shirt_size");
			$profile_shipping_domestic = $("#profile_shipping_domestic");
			$profile_shipping_address = $("#profile_shipping_address");
			$profile_shipping_city = $("#profile_shipping_city");
			$profile_shipping_state = $("#profile_shipping_state");
			$profile_shipping_zip = $("#profile_shipping_zip");
			$update_profile = $("#update_profile");

			$profile_shipping_domestic.bind("change",swapShippingType);
			$update_profile.click(doUpdate);
			$modify_email.click(showEmailModal);

			if (!current_email) {
				current_email = $profile_email.val();
			}
		}
	}

	function teardown(){
		if ($update_profile) {
			$update_profile.unbind("click");

			$profile_email = $modify_email = $profile_name = $profile_twitter = $profile_phone =
			$profile_credit = $profile_shirt_size = $profile_shipping_domestic =
			$profile_shipping_address = $profile_shipping_city =
			$profile_shipping_state = $profile_shipping_zip =
			$update_profile = null;
		}
	}

	function showEmailModal() {
		$("#email_modal").show();
		$("#update_email").click(doUpdateEmail);
		$("#cancel_update").click(hideEmailModal);
	}

	function hideEmailModal() {
		$("#email_modal").hide();
		$("#update_email, #cancel_update").unbind("click");
	}

	var $profile_email,
		$modify_email,
		$profile_name,
		$profile_twitter,
		$profile_phone,
		$profile_credit,
		$profile_shirt_size,
		$profile_shipping_domestic,
		$profile_shipping_address,
		$profile_shipping_city,
		$profile_shipping_state,
		$profile_shipping_zip,
		$update_profile,

		current_email
	;

	Pages.page_scripts["/profile"] = {
		init: init,
		teardown: teardown
	};

})(window,Pages);
