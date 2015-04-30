(function(global,Pages){
	"use strict";

	function doLogin() {
		var res, data,
			url_parts = Pages.parseUri(document.location.href.toString())
		;

		// if site is disabled, don't proceed
		if (Pages.disabled) {
			Notify.error("Not allowed");
			return;
		}

		data = {
			login_email: $login_email.val()
		};

		if (url_parts.anchor) {
			data.user_id = url_parts.anchor;
			data.user_id = data.user_id.replace(/[^a-f0-9\-]/ig,"");
		}

		// first validate the entered data
		res = Validate.checkLogin(data);

		if (res !== true) {
			Notify.error(res);
			return;
		}

		// make sure the data is formatted correctly
		Format.formatLogin(data);

		// Login user
		Notify.reset();
		Notify.notice("Verifying user ID and email, please wait...");
		$.ajax({
			type: "POST",
			url: "/user/verify",
			data: JSON.stringify(data),
			processData: false,
			contentType: "application/javascript; charset=UTF-8",
			dataType: "json"
		})
		.success(function(res) {
			Notify.reset();
			if (res.success) {
				Util.startSession(/*sessionID=*/res.success);
				postLogin();
			}
			else {
				Notify.error("Verification failed: " + (res.error || res));
			}
		})
		.error(function(jqx,err,errObj){
			Notify.reset();
			Notify.error("Verification failed: " + err + (errObj ? "; " + JSON.stringify(errObj.stack || errObj) : ""));
		});
	}

	function postLogin(data) {
		Pages.gotoPage("/profile",/*suppressHistory=*/true,data);
		Pages.replaceURL("/profile");
		Pages.updateNav(/*loggedIn=*/true);
	}

	function init(){
		$verify_user = $("#verify_user");
		$login_email = $("#login_email");

		$verify_user.click(doLogin);
	}

	function teardown(){
		$verify_user.unbind("click");
		$login_email = $verify_user = null;
	}

	var $login_email,
		$verify_user
	;

	Pages.page_scripts["/index"] = {
		init: init,
		teardown: teardown
	};

})(window,Pages);
