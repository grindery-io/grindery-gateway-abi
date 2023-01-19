const NexusClient = require("grindery-nexus-client").default;

const ENVIRONMENT = process.env.ENVIRONMENT;

module.exports = {
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
  getOutputFields: async (z, bundle, operation, chain) => {
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
            fieldData: {
              ...(chain ? { _grinderyChain: chain } : {}),
              ...bundle.inputData,
            },
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
          label: (field.label || field.key || "")
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
            .join(" "),
        }))) ||
      []
    );
  },
  getInputFields: async (z, bundle, operation, chain) => {
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
            fieldData: {
              ...(chain ? { _grinderyChain: chain } : {}),
              ...bundle.inputData,
            },
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
          .filter(
            (field) =>
              !chain || (chain && field.key !== "_grinderyContractAddress")
          )
          .map((field) => {
            let input = {
              key: field.key,
            };
            let label = "";
            switch (field.key) {
              case "_grinderyUseCustomAbi":
                input.label = "Set ABI manually";
                break;
              case "_grinderyAbi":
                input.label = "Custom ABI";
                break;
              case "_grinderyEvent":
                input.label = "Smart Contract Event";
                break;
              case "_grinderyFunction":
                input.label = "Smart Contract Function";
                break;
              default:
                input.label = (field.label || field.key || "")
                  .toLowerCase()
                  .split(" ")
                  .map(
                    (word) => word.charAt(0).toUpperCase() + word.substring(1)
                  )
                  .join(" ");
            }
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
            if (field.helpText) {
              input.helpText = field.helpText;
            } else {
              switch (field.key) {
                case "_grinderyUseCustomAbi":
                  input.helpText =
                    "If set to FALSE Grindery will try to get the ABI automatically ABI. If set to TRUE you can set the ABI yourself manually.";
                  break;
                case "_grinderyAbi":
                  input.helpText =
                    "Paste the contract ABI. This can be obtained either in [Remix](https://docs.moonbeam.network/builders/build/eth-api/dev-env/remix/) or in the .json file generally created after the compilation process (for example, in Truffle or HardHat).";
                  break;
                case "_grinderyEvent":
                  input.helpText =
                    "Select the smart contract event you want to use as a trigger. Next you will be able to set the parameters.";
                  break;
                case "_grinderyFunction":
                  input.helpText =
                    "Select the smart contract function you want to use as an action. Next you will be able to set the parameters.";
                  break;
                default:
                  input.helpText = "";
              }
            }

            input.altersDynamicFields = true;
            return input;
          })) ||
      [];
    return fields;
  },
};
