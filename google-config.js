var goog = {};

goog.returnPath = "/auth/google/return";
goog.returnURL = "http://localhost:8081" + goog.returnPath;
goog.realm = "http://localhost:8081/";

if(process.env.NODE_ENV=="prod")
{
	goog.returnURL = "http://mongo.sylog.net" + goog.returnPath;
	goog.realm = "http://mongo.sylog.net/";
}

exports = module.exports = goog;