import { assertNotEquals } from "./deps.ts";
import { lib } from "./lib.ts";
import { encodeCString } from "./utils.ts";
import { Future } from "./future.ts";

export class Transaction {
  private static FINALIZATION_REGISTRY = new FinalizationRegistry(
    (pointer: NonNullable<Deno.PointerValue>) => {
      lib.fdb_transaction_destroy(pointer);
    },
  );

  constructor(private pointer: NonNullable<Deno.PointerValue>) {
    Transaction.FINALIZATION_REGISTRY.register(this, pointer);
  }

  get(key: string, snapshot = 0) {
    const pointer = lib.fdb_transaction_get(
      this.pointer,
      encodeCString(key),
      key.length,
      snapshot,
    );
    assertNotEquals(pointer, null);
    return new Future(pointer!);
  }

  set(key: string, value: ArrayBuffer) {
    lib.fdb_transaction_set(
      this.pointer,
      encodeCString(key),
      key.length,
      Deno.UnsafePointer.of(value),
      value.byteLength,
    );
  }

  commit() {
    const pointer = lib.fdb_transaction_commit(this.pointer);
    assertNotEquals(pointer, null);
    return new Future(pointer!);
  }
}
