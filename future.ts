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
    const outPresentContainer = new PointerContainer();
    const outValueContainer = new PointerContainer();
    const outLengthContainer = new PointerContainer();
    checkFDBErr(lib.fdb_future_get_value(
      this.pointer,
      outPresentContainer.use(),
      outValueContainer.use(),
      outLengthContainer.use(),
    ));
    const outPresent = outPresentContainer.array[0] == 1n;
    if (!outPresent) {
      return null;
    }
    return Deno.UnsafePointerView.getArrayBuffer(
      outValueContainer.get(),
      Number(outLengthContainer.array[0]),
    );
  }
}
