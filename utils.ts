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
  return new TextEncoder().encode(`${string}\0`);
}

export class PointerContainer extends Deno.UnafePointerView {
  constructor(array = new BigUint64Array(1)) {
    const pointer = Deno.UnsafePointer.of(array)!;
    super(pointer);
  }

  use() {
    return this.pointer;
  }

  get() {
    const pointer = this.getPointer(0);
    if (pointer === null) {
      throw new Error("Unexpectedly found null pointer in PointerContainer");
    }
    return pointer;
  }
}
