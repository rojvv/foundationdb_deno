import { assertNotEquals } from "./deps.ts";
import { lib } from "./lib.ts";
import { encodeCString } from "./utils.ts";
import { Future } from "./future.ts";

export class Transaction {
  constructor(private pointer: NonNullable<Deno.PointerValue>) {
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
}
