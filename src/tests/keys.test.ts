import { describe, it, expect } from "vitest";
import { buildPK, buildSK } from "../infrastructure/dynamodb.repository";

describe("Dynamo keys", () => {
  it("buildPK arma la partición por asegurado", () => {
    expect(buildPK("12345")).toBe("INSURED#12345");
  });
  it("buildSK arma el sort key por cita", () => {
    expect(buildSK("a-b-c")).toBe("APPT#a-b-c");
  });
});
