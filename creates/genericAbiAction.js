const NexusClient = require("grindery-nexus-client").default;

const ENVIRONMENT = process.env.ENVIRONMENT;

// triggers on a new trigger_from_a_grindery_workflow with a certain tag
const perform = async (z, bundle) => {
  const client = new NexusClient();
  client.authenticate(`${bundle.authData.access_token}`);
  const step = {
    type: "action",
    connector: "evmGenericAbi",
    operation: "genericAbiAction",
  };
  const input = bundle.inputData;
  let nexus_response;
  try {
    nexus_response = await client.runAction(step, input, ENVIRONMENT);
  } catch (error) {
    if (error.message === "Invalid access token") {
      throw new z.errors.RefreshAuthError();
    } else {
      z.console.log("perform genericAbiAction error", error);
    }
  }
  z.console.log("Response from runAction (genericAbiAction): ", nexus_response);
  if (nexus_response) {
    return nexus_response;
  }
};

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#triggerschema
  key: "genericAbiAction",
  noun: "Call Smart-Contract Function",

  display: {
    label: "Call Smart-Contract Function",
    description: "Sends transaction to the smart-contract.",
  },

  operation: {
    perform: perform,

    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    inputFields: [
      async function (z, bundle) {
        const client = new NexusClient();
        client.authenticate(`${bundle.authData.access_token}`);
        let res;
        try {
          res = await client.callInputProvider(
            "evmGenericAbi",
            "genericAbiAction",
            {
              jsonrpc: "2.0",
              method: "grinderyNexusConnectorUpdateFields",
              id: new Date(),
              params: {
                key: "genericAbiAction",
                fieldData: bundle.inputData,
                authentication: "",
              },
            },
            ENVIRONMENT
          );
        } catch (error) {
          if (error.message === "Invalid access token") {
            throw new z.errors.RefreshAuthError();
          } else {
            z.console.log("callInputProvider err", error);
          }
        }
        z.console.log("callInputProvider res", res);

        function toObject(arr) {
          var rv = {};
          for (var i = 0; i < arr.length; i++) rv[arr[i].value] = arr[i].label;
          return rv;
        }

        return (
          (res &&
            res.inputFields &&
            res.inputFields.map((field) => ({
              key: field.key,
              label: field.label || field.key || "",
              type: "string",
              required: field.required,
              choices: (field.choices && toObject(field.choices)) || undefined,
              default: field.default || undefined,
              altersDynamicFields: true,
              dynamic:
                (field.key &&
                  field.key === "_grinderyChain" &&
                  "list_chains_trigger.key") ||
                undefined,
            }))) ||
          []
        );
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
      async function (z, bundle) {
        const client = new NexusClient();
        client.authenticate(`${bundle.authData.access_token}`);
        let res;
        try {
          res = await client.callInputProvider(
            "evmGenericAbi",
            "genericAbiAction",
            {
              jsonrpc: "2.0",
              method: "grinderyNexusConnectorUpdateFields",
              id: new Date(),
              params: {
                key: "genericAbiAction",
                fieldData: bundle.inputData,
                authentication: "",
              },
            },
            ENVIRONMENT
          );
        } catch (error) {
          if (error.message === "Invalid access token") {
            throw new z.errors.RefreshAuthError();
          } else {
            z.console.log("callInputProvider err", error);
          }
        }
        z.console.log("callInputProvider res", res);

        return (
          (res &&
            res.outputFields &&
            res.outputFields.map((field) => ({
              key: field.key,
              label: field.label || field.key || "",
            }))) ||
          []
        );
      },
    ],
  },
};
