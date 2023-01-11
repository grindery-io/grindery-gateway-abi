const NexusClient = require("grindery-nexus-client").default;

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
    nexus_response = await client.runAction(step, input, ENVIRONMENT);
  } catch (error) {
    if (error.message === "Invalid access token") {
      throw new z.errors.RefreshAuthError();
    } else {
      z.console.log("perform genericAbiAction error", error);
      throw new z.errors.Error(error.message);
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
      {
        key: "_grinderyChain",
        type: "string",
        label: "Blockchain",
        placeholder: "Select a blockchain",
        required: true,
        altersDynamicFields: true,
        dynamic: "list_chains_trigger.key",
      },
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

        const fields =
          (res &&
            res.inputFields &&
            res.inputFields
              .filter(
                (field) => field && field.key && field.key !== "_grinderyChain"
              )
              .map((field) => {
                let input = {
                  key: field.key,
                  label: field.label || field.key || "",
                };
                let type = "";
                switch (field.type) {
                  case "boolean":
                    type = "boolean";
                    break;
                  case "text":
                    type = "text";
                    break;
                  case "file":
                    type = "file";
                    break;
                  case "password":
                    type = "password";
                    break;
                  case "integer":
                    type = "integer";
                    break;
                  case "number":
                    type = "number";
                    break;
                  case "datetime":
                    type = "datetime";
                    break;
                  default:
                    type = "string";
                }
                input.type = type;
                if (field.required) {
                  input.required = true;
                }
                if (field.choices) {
                  input.choices = toObject(field.choices);
                }
                if (field.default) {
                  if (type === "boolean") {
                    if (field.default === "true") {
                      input.default = field.default;
                    }
                  } else {
                    input.default = field.default;
                  }
                }
                input.altersDynamicFields = true;
                return input;
              })) ||
          [];
        return fields;
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
