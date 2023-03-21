import { lib } from "./lib.ts";
import { checkFDBErr, PointerContainer } from "./utils.ts";

export class Future {
  private callback?: (future: Future) => void;

  constructor(private pointer: NonNullable<Deno.PointerValue>) {
    checkFDBErr(lib.fdb_future_set_callback(
      this.pointer,
      new Deno.UnsafeCallback(
        { parameters: ["pointer", "pointer"], result: "void" },
        (pointer) => {
          if (pointer) {
            this.callback?.(this);
          }
        },
      ).pointer,
      null,
    ));
  }

  blockUntilReady() {
    checkFDBErr(lib.fdb_future_block_until_ready(this.pointer));
  }

  getError() {
    checkFDBErr(lib.fdb_future_get_error(this.pointer));
  }

  setCallback(callback: (future: Future) => void) {
    this.callback = callback;
  }

  unsetCallback() {
    this.callback = undefined;
  }

  getValue() {
    const alloc = new ArrayBuffer(16);
    const outValueContainer = new PointerContainer(new BigUint64Array(alloc, 0, 1));
    const outPresentAndLengthBuffer = new Uint32Array(alloc, 8, 2);
    const outPresentPointer = Deno.UnsafePointer.of(outPresentAndLengthBuffer);
    const outLengthPointer = Deno.UnsafePointer.of(outPresentAndLengthBuffer.subarray(1));
    checkFDBErr(lib.fdb_future_get_value(
      this.pointer,
      outPresentPointer,
      outValueContainer.use(),
      outLengthPointer
    ));
    const outPresent = outPresentAndLengthBuffer[0] !== 0;
    if (!outPresent) {
      return null;
    }
    return Deno.UnsafePointerView.getArrayBuffer(
      outValueContainer.get(),
      outPresentAndLengthBuffer[1],
    );
  }
}
