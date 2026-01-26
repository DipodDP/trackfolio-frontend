import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import apiClient from "../api-client";

describe("apiClient", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("should have a timeout of 30000ms", async () => {
    mock.onGet("/test").timeout();
    await expect(apiClient.get("/test")).rejects.toThrow(
      "timeout of 30000ms exceeded"
    );
  });
});
