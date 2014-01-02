var passport = require('passport'),
	GoogleStrategy = require('passport-google').Strategy,
	users = require('./users.json'),
	googleConfig = require('./google-config');

function findByUsername(username, callback) {
	var user;

	for (var i = 0, len = users.length; i < len; i++) 
	{
  		user = users[i];
  		if (user.username === username) 
	  	{
	    	return callback(null, user);
	  	}
	}
	return callback(null, null);
}

function findById(idx, callback) {
	if (users[idx]) 
	{
  		callback(null, users[idx]);
	} 
	else {
  		callback(new Error('User ' + idx + ' does not exist'));
	}
}

function HandleGoogleAuth(openId, profile, done) {
	    		

	findByUsername(profile.emails[0].value, function(err, user) {
  		if (err) 
  		{ 
  			return done(err); 
  		}
  		if (!user) 
  		{ 
  			console.log('unknown user', profile.emails[0]);
  			return done(null, false, { 
  				message: 'Unknown user ' + username 
  			}); 
  		}
  
  		return done(null, user);
	});

}



exports = module.exports = function(app, settings) {

	settings = settings || {
		loginPage: "/login",
		loginPath: "/login/google",
		logoutPath: "/logout",
		homePage: "/"
	};


	this.initialize = function(){

		app.use(passport.initialize());
  		app.use(passport.session());

		passport.serializeUser(function(user, done) {
			console.log('serializeUser', user);
	    	done(null, user.id);
	  	});

	  	passport.deserializeUser(function(id, done) {
	   		findById(id, function (err, user) {
	   			console.log('deserializeUser', user);
	      		done(err, user);
	    	});
	  	});

	  	passport.use( new GoogleStrategy(googleConfig, HandleGoogleAuth ));

	  	// Redirect the user to Google for authentication.  When complete, Google
		// will redirect the user back to the application at
		//     /auth/google/return
		app.get(settings.loginPath, passport.authenticate('google') );

		// Google will redirect the user to this URL after authentication.  Finish
		// the process by verifying the assertion.  If valid, the user will be
		// logged in.  Otherwise, authentication has failed.
		app.get(
			googleConfig.returnPath,
			passport.authenticate('google', { 
				successRedirect: settings.homePage,
				failureRedirect: settings.loginPage 
			})
		);


		app.get(settings.logoutPath, function(req, res){
		    req.logout();
		    res.redirect( settings.homePage );
		});
	};



	this.AuthCheck = function (req, res, next) {

		if (req.isAuthenticated() || req.path == googleConfig.returnPath) 
		{
			return next();
		} 
		else {
			res.redirect( settings.loginPage );
		}
	};

	return this;
};