// tests/helpers/test-utils.ts
// Test utilities for StacksPledge contract tests

export const accounts = {
  deployer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  wallet1: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
  wallet2: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
  wallet3: "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC",
  wallet4: "ST2NEB84ASEZ3SFPJHDAJNNPF6BYRYEQXDCZKX9C",
  wallet5: "ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB",
};

export const contracts = {
  pledge: "stacks-pledge",
  token: "pledge-token",
};

export const fees = {
  pledgeFee: 1000n,
  vouchFee: 500n,
  completeFee: 500n,
};

export const errors = {
  ERR_NOT_FOUND: 100n,
  ERR_UNAUTHORIZED: 101n,
  ERR_ALREADY_COMPLETED: 102n,
  ERR_INSUFFICIENT_FUNDS: 103n,
  ERR_INVALID_MESSAGE: 104n,
  ERR_MAX_PLEDGES_REACHED: 105n,
  ERR_ALREADY_VOUCHED: 106n,
  ERR_SELF_VOUCH: 107n,
  ERR_MAX_VOUCHES_REACHED: 108n,
  ERR_PLEDGE_EXPIRED: 109n,
  ERR_CONTRACT_PAUSED: 110n,
};

export function createTestMessage(index: number): string {
  return `Test pledge message #${index} - commitment to improve`;
}

export function formatSTX(microSTX: bigint): string {
  return `${Number(microSTX) / 1_000_000} STX`;
}
