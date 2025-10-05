import { describe, it, expect } from "vitest";

const isFiveDigits = (s: string) => /^\d{5}$/.test(s);

describe("validation", () => {
  it("insuredId debe tener 5 dígitos", () => {
    expect(isFiveDigits("12345")).toBe(true);
    expect(isFiveDigits("1234")).toBe(false);
    expect(isFiveDigits("abcde")).toBe(false);
  });
});
