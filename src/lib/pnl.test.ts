import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateCostBasis,
  calculatePortfolioSummary,
  calculateRealizedPnl,
  calculateUnrealizedPnl,
} from './pnl';

test('calculateCostBasis uses quantity times average cost with fees included', () => {
  assert.equal(calculateCostBasis(2, 50, 5), 105);
});

test('calculateRealizedPnl computes profit from proceeds minus cost basis', () => {
  assert.equal(calculateRealizedPnl({ quantity: 3, averageEntryPrice: 20, proceeds: 75, fees: 2 }), 13);
});

test('calculateUnrealizedPnl handles negative unrealized value', () => {
  assert.equal(calculateUnrealizedPnl({ quantity: 5, averageEntryPrice: 100, currentPrice: 80 }), -100);
});

test('calculatePortfolioSummary sums holdings and cost basis safely', () => {
  const summary = calculatePortfolioSummary([
    { quantity: 2, averageCost: 40, currentPrice: 60 },
    { quantity: 3, averageCost: 20, currentPrice: 25 },
  ]);

  assert.equal(summary.totalValueUsd, 195);
  assert.equal(summary.costBasisUsd, 140);
  assert.equal(summary.unrealizedPnlUsd, 55);
});

test('partial sell scenarios calculate realized profit from the sold quantity only', () => {
  assert.equal(calculateRealizedPnl({ quantity: 2, averageEntryPrice: 50, proceeds: 120, fees: 3 }), 17);
});

test('zero quantity or zero-priced holdings do not create fake value', () => {
  const summary = calculatePortfolioSummary([
    { quantity: 0, averageCost: 100, currentPrice: 150 },
    { quantity: 2, averageCost: 0, currentPrice: 0 },
  ]);

  assert.equal(summary.totalValueUsd, 0);
  assert.equal(summary.costBasisUsd, 0);
  assert.equal(summary.unrealizedPnlUsd, 0);
});

test('invalid inputs are rejected with zero values', () => {
  assert.equal(calculateCostBasis(0, 50), 0);
  assert.equal(calculateRealizedPnl({ quantity: 0, averageEntryPrice: 100, proceeds: 200 }), 0);
  assert.equal(calculateUnrealizedPnl({ quantity: -1, averageEntryPrice: 100, currentPrice: 99 }), 0);
});
