import { lib } from "./lib.ts";
import { checkFDBErr, PointerContainer } from "./utils.ts";

const FUTURE_CB_MAP = new Map<number | bigint, Future>();
const FUTURE_CALLBACK = new Deno.UnsafeCallback(
  { parameters: ["pointer", "pointer"], result: "void" },
  (pointer) => {
    if (!pointer) {
      return;
    }
    const pointerValue = Deno.UnsafePointer.value(pointer)
    const future = FUTURE_CB_MAP.get(pointerValue);
    if (future) {
      FUTURE_CB_MAP.delete(pointerValue);
      future.callback?.(future);
    }
  },
);

export class Future {
  private callback?: (future: Future) => void;

  constructor(private pointer: NonNullable<Deno.PointerValue>) {
    FUTURE_CB_MAP.set(Deno.UnsafePointer.value(this.pointer), this);
    checkFDBErr(lib.fdb_future_set_callback(
      this.pointer,
      FUTURE_CALLBACK.pointer,
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
