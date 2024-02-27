const nconf = require("nconf");
const path = require("path");

const confFile =
  typeof process.env.NODE_ENV !== "undefined"
    ? "config.json"
    : "config.deploy.json";

nconf.argv().env().file("config", path.join(__dirname, confFile));

getAndSaveAppsettings();

function getAndSaveAppsettings() {
  let appsettings = nconf.get("app").appsettings;

  if (!path.isAbsolute(appsettings)) {
    appsettings = path.join(__dirname, appsettings);
  }

  const env = nconf.get("app").environment;

  console.log("environment: " + env);
  nconf.file(
    "appsettingsWithEnv",
    path.join(appsettings, "appsettings." + env + ".json"),
  );
  nconf.file("appsettings", path.join(appsettings, "appsettings.json"));

  nconf.file(
    "appsettingsServices",
    path.join(appsettings, "appsettings.services.json"),
  );
}

module.exports = nconf;
