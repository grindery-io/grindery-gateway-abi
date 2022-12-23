/* globals describe, expect, test, it */
const zapier = require("zapier-platform-core");
// Use this to make test calls into your app:
const App = require("../../index");
const { mockedToken } = require("../mock");

const appTester = zapier.createAppTester(App);

// read the `.env` file into the environment, if available
zapier.tools.env.inject();

describe("creates.genericAbiAction", () => {
  it("should throw auth error", async () => {
    const bundle = { authData: { access_token: "" }, inputData: {} };

    await expect(async () => {
      await appTester(App.creates.genericAbiAction.operation.perform, bundle);
    }).rejects.toThrow("Token required");
  });
});
