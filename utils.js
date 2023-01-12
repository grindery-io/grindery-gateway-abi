const NexusClient = require("grindery-nexus-client").default;

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
};
