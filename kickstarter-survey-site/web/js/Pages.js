(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition();
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Pages",this,function definition(name,context) {
	"use strict";

	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	function parseUri(e){var a=parseUri.options,f=a.parser[a.strictMode?"strict":"loose"].exec(e),b={},c=14;while(c--)b[a.key[c]]=f[c]||"";b[a.q.name]={};b[a.key[12]].replace(a.q.parser,function(h,d,g){if(d)b[a.q.name][d]=g});return b}parseUri.options={strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};

	function getPageURL(url) {
		var uriparts = parseUri(url);
		if (!uriparts.path) {
			return "/";
		}
		else {
			return uriparts.path;
		}
	}

	function siteInit() {
		// load and run script for current page
		current_page_url = getPageURL(context.document.location.href.toString());
		fetchPageScript(current_page_url);

		page_title = $("title").html();

		History.Adapter.bind(window,"statechange",function(){
			var state = History.getState();

			if (getPageURL(state.url) !== current_page_url) {
				gotoPage(state.url,/*suppressHistory=*/true);
			}
		});

		$(context.document.body).on("click","#logout",function(evt){
			if (Util.session_id) {
				$.ajax({
					type: "POST",
					url: "/logout/do",
					data: JSON.stringify({
						session_id: Util.session_id
					}),
					processData: false,
					contentType: "application/javascript; charset=UTF-8"
				})
				.complete(function(){
					Util.killSession();
					gotoPage("/",/*suppressHistory=*/true);
					Pages.replaceURL("/");
					Pages.updateNav(/*loggedIn=*/false);

					Notify.notice("Logged out!");
				});
			}

			evt.preventDefault();
			evt.stopImmediatePropagation();
		});

		$(context.document.body).on("click","a:not([data-ignore])",function(evt){
			var href = evt.currentTarget.href;

			// disable JS-only (or just empty) links
			if (evt.currentTarget.getAttribute("href") === "#") {
				evt.preventDefault();
				evt.stopImmediatePropagation();
			}
			else if (recognize(href) !== false) {
				evt.preventDefault();
				evt.stopImmediatePropagation();

				gotoPage(href);
			}
		});
	}

	function gotoPage(url,suppressHistory,passData) {
		var content_html, page_url;

		page_url = recognize(url);

		if (page_url !== false) {
			if (page_url !== current_page_url) {
				// teardown the existing page
				pageScriptAPI(current_page_url).teardown();

				Notify.reset();

				current_page_url = page_url;

				content_html = getPageContentHTML(current_page_url);
				$("#content").replaceWith(content_html);

				fetchPageScript(current_page_url,passData);

				if (!suppressHistory) {
					History.pushState(null,null,url);
					document.title = page_title;
				}

				return;
			}
		}

		if (url !== context.document.location.href.toString()) {
			context.document.location.href = url;
			current_page_url = getPageURL(url);
		}
	}

	function replaceURL(url) {
		History.replaceState(null,null,url);
		document.title = page_title;
	}

	function pageScriptAPI(url) {
		return public_api.page_scripts[(url === "/" ? "/index" : url)] || public_api.page_scripts["."];
	}

	function fetchPageScript(url,passData) {
		url = getPageURL(url);

		// remap the root page URL just for the purposes of this function
		if (url === "/") url = "/index";

		if (!(url in public_api.page_scripts)) {
			$LAB
			.script("/js/pages" + url + ".js")
			.wait(function(){
				pageScriptAPI(url).init(passData);
			});
		}
		else {
			pageScriptAPI(url).init(passData);
		}
	}

	function updateNav(loggedIn) {
		var nav_html = grips.render("/master#mainnav",{
			logged_in: loggedIn
		});
		$("#mainnav").replaceWith(nav_html);
	}

	// ******************

	function getPageHTML(url,data) {
		data = data || {};
		if (!("logged_in" in data) && Util.session_id) {
			data.logged_in = true;
		}

		try {
			// render page with 'grips' engine
			return public_api.grips.render(url + "#page",data);
		}
		catch (err) {
			console.error(err);
			return "";
		}
	}

	function getPageContentHTML(url,data) {
		return getSnippetHTML(url + "#content",data);
	}

	function getSnippetHTML(url,data) {
		data = data || {};
		if (!("logged_in" in data) && Util.session_id) {
			data.logged_in = true;
		}

		try {
			// render page with 'grips' engine
			return public_api.grips.render(url,data);
		}
		catch (err) {
			console.error(err);
			return "";
		}
	}

	function recognize(url) {
		url = getPageURL(url);

		if (url in public_api.grips.collections) {
			return url;
		}
		else {
			return false;
		}
	}

	context = context || {};

	var $ = context.$ || {},
		$LAB = context.$LAB || {},
		History = context.History || {},
		Util = context.Util || {},

		current_page_url,
		current_page_num,

		public_api,

		page_title
	;

	public_api = {
		// browser-only stuff
		siteInit: siteInit,
		gotoPage: gotoPage,
		replaceURL: replaceURL,
		fetchPageScript: fetchPageScript,
		updateNav: updateNav,
		page_scripts: {
			// default no-ops
			".": { init:function(){}, teardown:function(){} }
		},

		// used both in browser and on server
		getPageURL: getPageURL,
		getPageHTML: getPageHTML,
		getPageContentHTML: getPageContentHTML,
		getSnippetHTML: getSnippetHTML,
		recognize: recognize,
		parseUri: parseUri
	};

	return public_api;
});
