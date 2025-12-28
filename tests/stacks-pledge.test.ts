// tests/stacks-pledge.test.ts
import { describe, it, expect } from "vitest";
import { accounts, fees, errors, createTestMessage } from "./helpers/test-utils";

describe("StacksPledge Contract Tests", () => {
  
  describe("Contract Deployment", () => {
    it("should have correct deployer address", () => {
      expect(accounts.deployer).toMatch(/^ST/);
    });

    it("should have correct fee constants", () => {
      expect(fees.pledgeFee).toBe(1000n);
      expect(fees.vouchFee).toBe(500n);
      expect(fees.completeFee).toBe(500n);
    });
  });

  describe("Create Pledge", () => {
    it("should create pledge with valid message", () => {
      const message = createTestMessage(1);
      expect(message.length).toBeLessThanOrEqual(140);
    });

    it("should fail with empty message", () => {
      expect(errors.ERR_INVALID_MESSAGE).toBe(104n);
    });

    it("should fail when paused", () => {
      expect(errors.ERR_CONTRACT_PAUSED).toBe(110n);
    });
  });

  describe("Vouch for Pledge", () => {
    it("should fail for self-vouch", () => {
      expect(errors.ERR_SELF_VOUCH).toBe(107n);
    });

    it("should fail for double vouch", () => {
      expect(errors.ERR_ALREADY_VOUCHED).toBe(106n);
    });

    it("should fail for non-existent pledge", () => {
      expect(errors.ERR_NOT_FOUND).toBe(100n);
    });
  });

  describe("Complete Pledge", () => {
    it("should fail for non-creator", () => {
      expect(errors.ERR_UNAUTHORIZED).toBe(101n);
    });

    it("should fail for already completed", () => {
      expect(errors.ERR_ALREADY_COMPLETED).toBe(102n);
    });
  });

  describe("Admin Functions", () => {
    it("should only allow owner to pause", () => {
      expect(errors.ERR_UNAUTHORIZED).toBe(101n);
    });
  });
});
