import { getApiErrorMessage } from "../api-error";

const axiosError = (data: unknown, status = 400) => ({ response: { status, data } });

describe("getApiErrorMessage", () => {
  it("returns the message of a standard error body", () => {
    const err = axiosError({ code: "NOT_FOUND", message: "API client not found", details: {}, trace_id: "t-1" }, 404);
    expect(getApiErrorMessage(err, "fallback")).toBe("API client not found");
  });

  it("lists field messages of a validation error", () => {
    const err = axiosError(
      {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: { errors: [{ msg: "Field required" }, { msg: "Value too long" }] },
        trace_id: "t-2",
      },
      422
    );
    expect(getApiErrorMessage(err, "fallback")).toBe("Field required, Value too long");
  });

  it("appends the trace id to server errors so users can report them", () => {
    const err = axiosError({ code: "BAD_GATEWAY", message: "Broker request failed", details: {}, trace_id: "t-3" }, 502);
    expect(getApiErrorMessage(err, "fallback")).toBe("Broker request failed (ref: t-3)");
  });

  it("falls back when there is no usable response body", () => {
    expect(getApiErrorMessage(new Error("Network Error"), "Could not reach the server")).toBe(
      "Could not reach the server"
    );
    expect(getApiErrorMessage(axiosError("<html>502</html>", 502), "fallback")).toBe("fallback");
  });
});
