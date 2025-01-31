import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensures only owner can record metrics",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "chain-pulse",
        "record-block-metrics",
        [types.uint(1), types.uint(10), types.uint(5), types.uint(1000), types.uint(12345)],
        wallet1.address
      ),
    ]);
    
    block.receipts[0].result.expectErr(100);
  },
});

Clarinet.test({
  name: "Cannot record duplicate or out-of-order blocks",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "chain-pulse",
        "record-block-metrics",
        [types.uint(2), types.uint(10), types.uint(5), types.uint(1000), types.uint(12345)],
        deployer.address
      ),
      Tx.contractCall(
        "chain-pulse", 
        "record-block-metrics",
        [types.uint(1), types.uint(10), types.uint(5), types.uint(1000), types.uint(12345)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk(true);
    block.receipts[1].result.expectErr(102);
  },
});

Clarinet.test({
  name: "Can record and retrieve block metrics",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "chain-pulse", 
        "record-block-metrics",
        [types.uint(1), types.uint(10), types.uint(5), types.uint(1000), types.uint(12345)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk(true);

    let metrics = chain.callReadOnlyFn(
      "chain-pulse",
      "get-block-metrics",
      [types.uint(1)],
      deployer.address
    );

    assertEquals(
      metrics.result.expectSome(),
      {
        'tx-count': types.uint(10),
        'active-addresses': types.uint(5),
        'total-volume': types.uint(1000),
        'timestamp': types.uint(12345)
      }
    );
  },
});

Clarinet.test({
  name: "Aggregate stats update correctly", 
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "chain-pulse",
        "record-block-metrics", 
        [types.uint(1), types.uint(10), types.uint(5), types.uint(1000), types.uint(12345)],
        deployer.address
      ),
    ]);

    let stats = chain.callReadOnlyFn(
      "chain-pulse",
      "get-total-stats",
      [],
      deployer.address
    );

    assertEquals(
      stats.result.expectOk(),
      {
        'transactions': types.uint(10),
        'addresses': types.uint(5), 
        'volume': types.uint(1000),
        'last-height': types.uint(1)
      }
    );
  },
});
