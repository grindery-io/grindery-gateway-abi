const {
  getOutputFields,
  getInputFields,
  contractField,
  performResumeAction,
  performAsyncAction,
  getNoun,
} = require("../utils");

const actionKey = "genericAbiActionMumbaiTestnet";
const chain = "eip155:80001";
const chainName = "Mumbai Testnet";

const perform = async (z, bundle) => {
  return await performAsyncAction(z, bundle, chain);
};

const noun = getNoun(chainName, "action");

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#triggerschema
  key: actionKey,
  noun: noun,

  display: {
    label: chainName,
    description: `Calls a smart-contract function on the ${chainName} Blockchain.`,
  },

  operation: {
    perform: perform,
    performResume: performResumeAction,
    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    inputFields: [
      contractField,
      async (z, bundle) => {
        return await getInputFields(z, bundle, "genericAbiAction", chain);
      },
    ],

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obvious placeholder values that we can show to any user.
    sample: {
      _grinderyChain: chain,
    },

    // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
    // For a more complete example of using dynamic fields see
    // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
    // Alternatively, a static field definition can be provided, to specify labels for the fields
    outputFields: [
      // these are placeholders to match the example `perform` above
      // {key: 'id', label: 'Person ID'},
      // {key: 'name', label: 'Person Name'}
      async (z, bundle) => {
        return await getOutputFields(z, bundle, "genericAbiAction", chain);
      },
    ],
  },
};
