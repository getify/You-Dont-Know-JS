(function(global){
	"use strict";

	var docready = ASQ(function(done){
		$(document).ready(done);
	});

	// re-establish user session (if any)
	Util.restoreSession()
	.then(function(){
		docready.val(function(){
			Pages.updateNav(/*loggedIn=*/true);
		});
	})
	.or(function(){
		docready.val(function(){
			Pages.updateNav(/*loggedIn=*/false);
		});
	});

	Pages.grips = Tmpls.grips = grips;

	Tmpls.init();

	docready
	.val(function(){
		Pages.siteInit();
	});

})(window);
