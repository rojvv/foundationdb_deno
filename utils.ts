import { assertNotEquals } from "./deps.ts";
import { lib } from "./lib.ts";

export class FDBError extends Error {
  constructor(code: number) {
    let message: string | undefined;
    const ptr = lib.fdb_get_error(code);
    if (ptr) {
      message = Deno.UnsafePointerView.getCString(ptr);
    }
    super(message);
  }
}

export function checkFDBErr(code: number) {
  if (code) {
    throw new FDBError(code);
  }
}

export function encodeCString(string: string) {
  return new Uint8Array([...new TextEncoder().encode(string), 0]);
}

export class PointerContainer {
  constructor(public array = new BigUint64Array(1)) {
  }

  use() {
    return Deno.UnsafePointer.of(this.array);
  }

  get() {
    const pointer = Deno.UnsafePointer.create(this.array[0]);
    assertNotEquals(pointer, null);
    return pointer!;
  }
}
