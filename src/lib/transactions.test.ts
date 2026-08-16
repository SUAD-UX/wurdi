import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertChainMatchesIntent,
  assertWalletMatchesIntent,
  isIntentExpired,
  validatePreparedIntentInput,
} from './transactions';

test('valid transaction intent payloads are normalized and accepted', () => {
  const input = {
    walletAddress: '0x0000000000000000000000000000000000000001',
    chainId: 1,
    destinationAddress: '0x0000000000000000000000000000000000000002',
    amount: 0.5,
    tokenAddress: null,
    assetSymbol: 'ETH',
    assetName: 'Ethereum',
    decimals: 18,
  };

  const result = validatePreparedIntentInput(input);
  assert.equal(result.amount, 0.5);
  assert.equal(result.walletAddress, '0x0000000000000000000000000000000000000001');
  assert.equal(result.destinationAddress, '0x0000000000000000000000000000000000000002');
});

test('invalid amounts are rejected', () => {
  assert.throws(() => validatePreparedIntentInput({
    walletAddress: '0x0000000000000000000000000000000000000001',
    chainId: 1,
    destinationAddress: '0x0000000000000000000000000000000000000002',
    amount: 0,
  }));
});

test('wrong wallet is rejected', () => {
  assert.throws(() => assertWalletMatchesIntent(
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000002',
  ), /does not match/);
});

test('wrong chain is rejected', () => {
  assert.throws(() => assertChainMatchesIntent(1, 8453), /does not match/);
});

test('expired intents are recognized', () => {
  assert.equal(isIntentExpired(new Date(Date.now() - 60_000)), true);
  assert.equal(isIntentExpired(new Date(Date.now() + 60_000)), false);
});
