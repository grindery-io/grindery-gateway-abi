const genericAbiAction = require("./creates/genericAbiAction");
const genericAbiTrigger = require("./triggers/genericAbiTrigger");
const {
  config: authentication,
  befores = [],
  afters = [],
} = require("./authentication");
const listChains = require("./triggers/listChains");

const App = {
  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we can upload
  version: require("./package.json").version,
  platformVersion: require("zapier-platform-core").version,

  authentication: authentication,

  // beforeRequest & afterResponse are optional hooks into the provided HTTP client
  beforeRequest: [...befores],

  afterResponse: [...afters],

  // If you want to define optional resources to simplify creation of triggers, searches, creates - do that here!
  resources: {},

  // If you want your trigger to show up, you better include it here!
  triggers: {
    [listChains.key]: listChains,
    [genericAbiTrigger.key]: genericAbiTrigger,
  },

  // If you want your searches to show up, you better include it here!
  searches: {},

  // If you want your creates to show up, you better include it here!
  creates: {
    [genericAbiAction.key]: genericAbiAction,
  },
};

// Finally, export the app.
module.exports = App;
