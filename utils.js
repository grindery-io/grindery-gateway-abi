const NexusClient = require("grindery-nexus-client").default;

const ENVIRONMENT = process.env.ENVIRONMENT;

module.exports = {
  getSamples: async () => {
    let trigger_key = "evmGenericAbi";
    let trigger_item = "genericAbiTrigger";
    const client = new NexusClient();
    const nexus_response = await client.getDriver(trigger_key);
    let object = {};
    if (nexus_response) {
      let selected_trigger_method = nexus_response.triggers.filter(
        (trigger) => trigger.key === trigger_item
      );
      if (selected_trigger_method.length >= 1) {
        object = selected_trigger_method[0].operation.sample;
        let renamed_object = {};

        //iterate through the outputFields, find the corresponding key, assign the new key and its value
        selected_trigger_method[0].operation.outputFields.map((field) => {
          renamed_object = {
            [field.label]: object[field.key],
            ...renamed_object,
          };
        });
        return { items: [renamed_object] };
      } else {
        return { items: [] };
      }
    } else {
      return { items: [] };
    }
  },
  getCreatorId: (token) => {
    try {
      const client = new NexusClient();
      client.authenticate(token);
      const user = client.getUser();
      return user.id;
    } catch (error) {
      //force token refresh if invalid
      if (error.message === "Invalid access token") {
        throw new z.errors.RefreshAuthError();
      } else {
        z.console.log("Error in getCreatorId function", error.message);
      }
    }
  },
  uniqueID: () => {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4();
  },
  getOutputFields: async (z, bundle, operation) => {
    const client = new NexusClient();
    client.authenticate(`${bundle.authData.access_token}`);
    let res;
    try {
      res = await client.callInputProvider(
        "evmGenericAbi",
        operation,
        {
          jsonrpc: "2.0",
          method: "grinderyNexusConnectorUpdateFields",
          id: new Date(),
          params: {
            key: operation,
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
  getInputFields: async (z, bundle, operation) => {
    const client = new NexusClient();
    client.authenticate(`${bundle.authData.access_token}`);
    let res;
    try {
      res = await client.callInputProvider(
        "evmGenericAbi",
        operation,
        {
          jsonrpc: "2.0",
          method: "grinderyNexusConnectorUpdateFields",
          id: new Date(),
          params: {
            key: operation,
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
};
