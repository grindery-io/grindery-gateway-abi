// Generic action
const genericAbiAction = require("./creates/genericAbiAction");

// Actions by chain
const genericAbiActionArbitrum = require("./creates/genericAbiActionArbitrum");
const genericAbiActionAvalanche = require("./creates/genericAbiActionAvalanche");
const genericAbiActionBinance = require("./creates/genericAbiActionBinance");
const genericAbiActionBSCTestnet = require("./creates/genericAbiActionBSCTestnet");
const genericAbiActionCelo = require("./creates/genericAbiActionCelo");
const genericAbiActionCronos = require("./creates/genericAbiActionCronos");
const genericAbiActionCronosTestnet = require("./creates/genericAbiActionCronosTestnet");
const genericAbiActionEthereum = require("./creates/genericAbiActionEthereum");
const genericAbiActionFantom = require("./creates/genericAbiActionFantom");
const genericAbiActionGnosis = require("./creates/genericAbiActionGnosis");
const genericAbiActionGoerli = require("./creates/genericAbiActionGoerli");
const genericAbiActionHarmony = require("./creates/genericAbiActionHarmony");
const genericAbiActionPolygon = require("./creates/genericAbiActionPolygon");
const genericAbiActionMumbaiTestnet = require("./creates/genericAbiActionMumbaiTestnet");

// Generic trigger
const genericAbiTrigger = require("./triggers/genericAbiTrigger");

// Triggers by chain
const genericAbiTriggerArbitrum = require("./triggers/genericAbiTriggerArbitrum");
const genericAbiTriggerAvalanche = require("./triggers/genericAbiTriggerAvalanche");
const genericAbiTriggerBinance = require("./triggers/genericAbiTriggerBinance");
const genericAbiTriggerBSCTestnet = require("./triggers/genericAbiTriggerBSCTestnet");
const genericAbiTriggerCelo = require("./triggers/genericAbiTriggerCelo");
const genericAbiTriggerCronos = require("./triggers/genericAbiTriggerCronos");
const genericAbiTriggerCronosTestnet = require("./triggers/genericAbiTriggerCronosTestnet");
const genericAbiTriggerEthereum = require("./triggers/genericAbiTriggerEthereum");
const genericAbiTriggerFantom = require("./triggers/genericAbiTriggerFantom");
const genericAbiTriggerGnosis = require("./triggers/genericAbiTriggerGnosis");
const genericAbiTriggerGoerli = require("./triggers/genericAbiTriggerGoerli");
const genericAbiTriggerHarmony = require("./triggers/genericAbiTriggerHarmony");
const genericAbiTriggerPolygon = require("./triggers/genericAbiTriggerPolygon");
const genericAbiTriggerMumbaiTestnet = require("./triggers/genericAbiTriggerMumbaiTestnet");

// Authentication
const {
  config: authentication,
  befores = [],
  afters = [],
} = require("./authentication");

// Chains list
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
    [genericAbiTriggerArbitrum.key]: genericAbiTriggerArbitrum,
    [genericAbiTriggerAvalanche.key]: genericAbiTriggerAvalanche,
    [genericAbiTriggerBinance.key]: genericAbiTriggerBinance,
    [genericAbiTriggerBSCTestnet.key]: genericAbiTriggerBSCTestnet,
    [genericAbiTriggerCelo.key]: genericAbiTriggerCelo,
    [genericAbiTriggerCronos.key]: genericAbiTriggerCronos,
    [genericAbiTriggerCronosTestnet.key]: genericAbiTriggerCronosTestnet,
    [genericAbiTriggerEthereum.key]: genericAbiTriggerEthereum,
    [genericAbiTriggerFantom.key]: genericAbiTriggerFantom,
    [genericAbiTriggerGnosis.key]: genericAbiTriggerGnosis,
    [genericAbiTriggerGoerli.key]: genericAbiTriggerGoerli,
    [genericAbiTriggerHarmony.key]: genericAbiTriggerHarmony,
    [genericAbiTriggerPolygon.key]: genericAbiTriggerPolygon,
    [genericAbiTriggerMumbaiTestnet.key]: genericAbiTriggerMumbaiTestnet,
  },

  // If you want your searches to show up, you better include it here!
  searches: {},

  // If you want your creates to show up, you better include it here!
  creates: {
    [genericAbiAction.key]: genericAbiAction,
    [genericAbiActionArbitrum.key]: genericAbiActionArbitrum,
    [genericAbiActionAvalanche.key]: genericAbiActionAvalanche,
    [genericAbiActionBinance.key]: genericAbiActionBinance,
    [genericAbiActionBSCTestnet.key]: genericAbiActionBSCTestnet,
    [genericAbiActionCelo.key]: genericAbiActionCelo,
    [genericAbiActionCronos.key]: genericAbiActionCronos,
    [genericAbiActionCronosTestnet.key]: genericAbiActionCronosTestnet,
    [genericAbiActionEthereum.key]: genericAbiActionEthereum,
    [genericAbiActionFantom.key]: genericAbiActionFantom,
    [genericAbiActionGnosis.key]: genericAbiActionGnosis,
    [genericAbiActionGoerli.key]: genericAbiActionGoerli,
    [genericAbiActionHarmony.key]: genericAbiActionHarmony,
    [genericAbiActionPolygon.key]: genericAbiActionPolygon,
    [genericAbiActionMumbaiTestnet.key]: genericAbiActionMumbaiTestnet,
  },
};

// Finally, export the app.
module.exports = App;
