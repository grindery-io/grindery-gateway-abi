const NexusClient = require("grindery-nexus-client").default;
const {
  getCreatorId,
  uniqueID,
  getOutputFields,
  getInputFields,
} = require("../utils");

const ENVIRONMENT = process.env.ENVIRONMENT;

const workflowSource = {
  staging: "urn:grindery-staging:zapier-abi",
  production: "urn:grindery:zapier-abi",
};

// triggers on a new genericAbiTrigger
const perform = async (z, bundle) => {
  const payload = {
    ...bundle.cleanedRequest,
  };
  delete payload.querystring;
  return [payload];
};

//This method retrieves sample documents from Grindery Drivers
const performTransactionList = async (z, bundle) => {
  const data = await getOutputFields(
    z,
    bundle,
    "genericAbiTrigger",
    "eip155:56"
  );

  if (data.length === 0) {
    return [];
  } else {
    let obj = {};
    data.map((field) => {
      obj = {
        ...obj,
        [field.key]: "Sample value",
      };
    });
    return [obj];
  }
};

//subscribe this hook to the endpoint
const subscribeHook = async (z, bundle) => {
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
      const client = new NexusClient();
      client.authenticate(`${bundle.authData.access_token}`);

      const outputFields = await getOutputFields(
        z,
        bundle,
        "genericAbiTrigger",
        "eip155:56"
      );

      // trigger input object
      let input = {
        _grinderyChain: "eip155:56",
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

      // main workflow object
      let workflow = {
        state: "on",
        title: `Trigger a Zap ${token}`,
        creator: creator,
        actions: action,
        trigger: trigger,
        source: workflowSource[ENVIRONMENT] || workflowSource[0],
      };

      const create_workflow_response = await client.createWorkflow(workflow);
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

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#triggerschema
  key: "genericAbiTriggerBinance",
  noun: "Binance",

  display: {
    label: "Binance",
    description:
      "Triggers when a smart contract event is detected on the Binance Blockchain",
  },

  operation: {
    type: "hook",
    perform: perform,
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    performList: performTransactionList,
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
        return await getInputFields(
          z,
          bundle,
          "genericAbiTrigger",
          "eip155:56"
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
      async (z, bundle) => {
        return await getOutputFields(
          z,
          bundle,
          "genericAbiTrigger",
          "eip155:56"
        );
      },
    ],
  },
};
