const NexusClient = require("grindery-nexus-client").default;
const { getOutputFields, getInputFields } = require("../utils");

const ENVIRONMENT = process.env.ENVIRONMENT;

const perform = async (z, bundle) => {
  const client = new NexusClient();

  try {
    client.authenticate(`${bundle.authData.access_token}`);
  } catch (error) {
    throw new z.errors.Error(error.message);
  }
  const step = {
    type: "action",
    connector: "evmGenericAbi",
    operation: "genericAbiAction",
  };
  const input = bundle.inputData;
  let nexus_response;
  try {
    nexus_response = await client.runAction(
      step,
      { _grinderyChain: "eip155:25", ...input },
      ENVIRONMENT
    );
  } catch (error) {
    if (error.message === "Invalid access token") {
      throw new z.errors.RefreshAuthError();
    } else {
      z.console.log("perform genericAbiActionCronos error", error);
      throw new z.errors.Error(error.message);
    }
  }
  z.console.log(
    "Response from runAction (genericAbiActionCronos): ",
    nexus_response
  );
  if (nexus_response) {
    return nexus_response;
  }
};

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#triggerschema
  key: "genericAbiActionCronos",
  noun: "Smart-Contract Function on Cronos chain",

  display: {
    label: "Smart-Contract Function on Cronos chain",
    description: "Sends transaction to the smart-contract on Cronos chain.",
  },

  operation: {
    perform: perform,
    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    inputFields: [
      {
        key: "_grinderyContractAddress",
        type: "string",
        label: "Smart-contract address",
        required: true,
        altersDynamicFields: true,
      },
      async (z, bundle) => {
        return await getInputFields(z, bundle, "genericAbiAction", "eip155:25");
      },
    ],

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obvious placeholder values that we can show to any user.
    //sample: {},

    // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
    // For a more complete example of using dynamic fields see
    // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
    // Alternatively, a static field definition can be provided, to specify labels for the fields
    outputFields: [
      // these are placeholders to match the example `perform` above
      // {key: 'id', label: 'Person ID'},
      // {key: 'name', label: 'Person Name'}
      async (z, bundle) => {
        return await getOutputFields(
          z,
          bundle,
          "genericAbiAction",
          "eip155:25"
        );
      },
    ],
  },
};
