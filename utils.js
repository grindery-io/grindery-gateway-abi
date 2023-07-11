const NexusClient = require("grindery-nexus-client").default;

const ENVIRONMENT = process.env.ENVIRONMENT;

const workflowSource = {
  staging: "urn:grindery-staging:zapier-abi",
  production: "urn:grindery:zapier-abi",
};

const contractField = {
  key: "_grinderyContractAddress",
  type: "string",
  label: "Smart Contract Address",
  helpText:
    "Indicate the address of the smart contract you want to interact with. Make sure the address matches the block chain you selected.",
  required: true,
  altersDynamicFields: true,
};

const getCreatorId = (token) => {
  try {
    const client = new NexusClient(token);
    const user = client.user.get();
    return user.id;
  } catch (error) {
    //force token refresh if invalid
    if (error.message === "Invalid access token") {
      throw new z.errors.RefreshAuthError();
    } else {
      z.console.log("Error in getCreatorId function", error.message);
    }
  }
};

const uniqueID = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4();
};

const getOutputFields = async (z, bundle, operation, chain) => {
  const client = new NexusClient(bundle.authData.access_token);
  let res;
  try {
    res = await client.connector.callInputProvider({
      connectorKey: "evmGenericAbi",
      operationKey: operation,
      body: {
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
      environment: ENVIRONMENT,
    });
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
        sample: (res.sample && res.sample[field.key]) || "Sample value",
      }))) ||
    []
  );
};

const getInputFields = async (z, bundle, operation, chain) => {
  const client = new NexusClient(bundle.authData.access_token);
  let res;
  try {
    res = await client.connector.callInputProvider({
      connectorKey: "evmGenericAbi",
      operationKey: operation,
      body: {
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
      environment: ENVIRONMENT,
    });
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
        .filter((field) => field && field.key && field.key !== "_grinderyChain")
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
                .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
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
};

const subscribeHook = async (z, bundle, chain) => {
  let token = uniqueID(); //generate a unique_id and register the webhook
  const options = {
    url: `https://connex-zapier-grindery.herokuapp.com/webhooks`,
    method: "POST",
    body: {
      url: bundle.targetUrl,
      token: token,
    },
  };

  // create nexus workflow with zapier action
  return z.request(options).then(async (response) => {
    // create workflow
    try {
      const client = new NexusClient(bundle.authData.access_token);
      const chains = await client.chain.list({
        type: "evm",
        environment: ENVIRONMENT,
      });

      const outputFields = await getOutputFields(
        z,
        bundle,
        "genericAbiTrigger",
        chain
      );

      // trigger input object
      let input = {
        ...(chain ? { _grinderyChain: chain } : {}),
        ...bundle.inputData,
      };

      // output object from trigger
      let output = {};

      outputFields.map((outField) => {
        output = {
          ...output,
          [outField.key]: `{{trigger.${[outField.key]}}}`,
        };
      });

      // trigger object
      let trigger = {
        type: "trigger",
        connector: "evmGenericAbi",
        operation: "genericAbiTrigger",
        input: input,
      };

      // find the creator id from the access_token
      let creator = getCreatorId(bundle.authData.access_token);

      // action after creating trigger
      let action = [
        {
          type: "action",
          connector: "zapier",
          operation: "triggerZap",
          input: {
            token: token,
            data: JSON.stringify(output),
          },
        },
      ];

      const chainObj = chains.find((c) => c.value === chain);
      const chainName = chainObj ? chainObj.label : chain;

      // main workflow object
      let workflow = {
        state: "on",
        title: `Trigger a Grindery Gateway ABI Zap on "${bundle.inputData._grinderyEvent}" event of ${bundle.inputData._grinderyContractAddress} contract on ${chainName} blockchain`,
        creator: creator,
        actions: action,
        trigger: trigger,
        source: workflowSource[ENVIRONMENT] || workflowSource[0],
      };

      const create_workflow_response = await client.workflow.create({
        workflow,
      });
      const data = await z.JSON.parse(response.content);
      const response_object = {
        workflow_key: create_workflow_response.key,
        ...data,
      };

      // save workflow
      const save_options = {
        url: `https://connex-zapier-grindery.herokuapp.com/saveWorkflow`,
        method: "POST",
        body: {
          id: data.id,
          workflow: workflow,
        },
      };

      return z.request(save_options).then(async (response) => {
        z.console.log("saving workflow response: ", response);
        z.console.log(
          "Returned Object from Subscribe Action: ",
          response_object
        );
        return response_object;
      });
    } catch (error) {
      if (error.message === "Invalid access token") {
        z.console.log(
          "Line 216 - Auth Error in Subscribe Method (trigger_from_a_grindery_workflow)",
          error.message
        );
        throw new z.errors.RefreshAuthError();
      } else {
        z.console.log(
          "Error occured in trigger from a grindery workflow: ",
          error.message
        );
      }
    }
  });
};

const unsubscribeHook = async (z, bundle) => {
  // bundle.subscribeData contains the parsed response from the subscribeHook function.
  const hookId = bundle.subscribeData.id;
  const workflow_key = bundle.subscribeData.workflow_key;
  z.console.log("unsubscribe hook: ", hookId);

  const options = {
    url: `https://connex-zapier-grindery.herokuapp.com/webhooks/${hookId}/${workflow_key}`,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${bundle.authData.access_token}`,
      accept: "application/json",
    },
  };

  const unsub_response = await z.request(options);
  if (unsub_response.status !== 200) {
    z.console.log(unsub_response);
  } else {
    return { message: "Unsubscribed: ", hookId };
  }
};

const performTransactionList = async (z, bundle, chain) => {
  const data = await getOutputFields(z, bundle, "genericAbiTrigger", chain);

  if (data.length === 0) {
    return [];
  } else {
    let obj = {};
    data.map((field) => {
      obj = {
        ...obj,
        [field.key]: field.sample || "Sample value",
      };
    });
    return [obj];
  }
};

const performAction = async (z, bundle, chain) => {
  const client = new NexusClient(bundle.authData.access_token);

  const step = {
    type: "action",
    connector: "evmGenericAbi",
    operation: "genericAbiAction",
  };
  const input = bundle.inputData;
  let nexus_response;
  try {
    nexus_response = await client.connector.runAction({
      step,
      input: { _grinderyChain: chain, ...input },
      environment: ENVIRONMENT,
    });
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

const performAsyncAction = async (z, bundle, chain) => {
  const client = new NexusClient(bundle.authData.access_token);

  const step = {
    type: "action",
    connector: "evmGenericAbi",
    operation: "genericAbiAction",
  };
  const input = bundle.inputData;

  let nexus_response;
  if (bundle.meta.isLoadingSample) {
    try {
      nexus_response = await client.connector.testAction({
        step,
        input: { _grinderyChain: chain, ...input },
        environment: ENVIRONMENT,
      });
    } catch (error) {
      if (error.message === "Invalid access token") {
        throw new z.errors.RefreshAuthError();
      } else {
        z.console.log("perform performAsyncAction error", error);
        throw new z.errors.Error(error.message);
      }
    }
  } else {
    const callbackUrl = z.generateCallbackUrl();

    try {
      nexus_response = await client.connector.runActionAsync({
        callbackUrl,
        step,
        input: { _grinderyChain: chain, ...input },
        environment: ENVIRONMENT,
      });
    } catch (error) {
      if (error.message === "Invalid access token") {
        throw new z.errors.RefreshAuthError();
      } else {
        z.console.log("perform performAsyncAction error", error);
        throw new z.errors.Error(error.message);
      }
    }
  }

  z.console.log(
    "Response from runActionAsync (performAsyncAction): ",
    nexus_response
  );
  if (nexus_response) {
    return nexus_response;
  }
};

const performResumeAction = async (z, bundle) => {
  z.console.log(
    "Response from runActionAsync callback (genericAbiAction): ",
    bundle.cleanedRequest
  );
  if (
    bundle.cleanedRequest &&
    bundle.cleanedRequest.success &&
    bundle.cleanedRequest.result
  ) {
    return bundle.cleanedRequest.result;
  } else {
    throw new z.errors.Error(bundle.cleanedRequest.error || "Unknown error");
  }
};

const getNoun = (chainName, type) => {
  if (type === "trigger") {
    return `Event on ${chainName} blockchain`;
  }
  if (type === "action") {
    return `Transaction on ${chainName} blockchain`;
  }
  return chainName;
};

module.exports = {
  contractField,
  getCreatorId,
  uniqueID,
  getOutputFields,
  getInputFields,
  subscribeHook,
  unsubscribeHook,
  performTransactionList,
  performAction,
  performAsyncAction,
  performResumeAction,
  getNoun,
};
