import MockAdapter from "axios-mock-adapter";
import apiClient from "@/lib/api-client";
import { OrderError, placeMarketOrder } from "../orders";

const params = {
  apiClientId: 1,
  accountId: "2000012345",
  figi: "BBG004730N88",
  lots: 2,
  direction: "BUY" as const,
  idempotencyKey: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
};
const url = "/api-clients/1/orders/market";

describe("placeMarketOrder", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("sends the idempotency key with the order", async () => {
    mock.onPost(url).reply(201, { order_id: "o-1" });

    await placeMarketOrder(params);

    expect(JSON.parse(mock.history.post[0].data)).toEqual({
      figi: "BBG004730N88",
      lots: 2,
      direction: "BUY",
      account_id: "2000012345",
      idempotency_key: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    });
  });

  it("reports a rejected order as definitely not placed", async () => {
    mock.onPost(url).reply(403, { code: "FORBIDDEN", message: "Production orders are disabled.", details: {}, trace_id: "t" });

    const error = await placeMarketOrder(params).catch((e) => e);

    expect(error).toBeInstanceOf(OrderError);
    expect(error.message).toBe("Production orders are disabled.");
    expect(error.outcomeUnknown).toBe(false);
  });

  it.each([
    ["a gateway timeout", (m: MockAdapter) => m.onPost(url).reply(504, { code: "GATEWAY_TIMEOUT", message: "Broker API request timed out", details: {}, trace_id: "t" })],
    ["a network failure", (m: MockAdapter) => m.onPost(url).networkError()],
  ])("flags %s as an unknown outcome so the retry reuses the key", async (_name, arrange) => {
    arrange(mock);

    const error = await placeMarketOrder(params).catch((e) => e);

    expect(error).toBeInstanceOf(OrderError);
    expect(error.outcomeUnknown).toBe(true);
  });
});
