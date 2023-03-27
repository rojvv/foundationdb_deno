import { lib } from "./lib.ts";
import { checkFDBErr, encodeCString, PointerContainer } from "./utils.ts";
import { Transaction } from "./transaction.ts";
import { Tenant } from "./tenant.ts";
import { options } from "./options.ts";

export class Database {
  private static FINALIZATION_REGISTRY = new FinalizationRegistry(
    (pointer: NonNullable<Deno.PointerValue>) => {
      lib.fdb_database_destroy(pointer);
    },
  );

  constructor(private pointer: NonNullable<Deno.PointerValue>) {
    Database.FINALIZATION_REGISTRY.register(this, pointer);
  }

  createTransaction() {
    const container = new PointerContainer();
    checkFDBErr(
      lib.fdb_database_create_transaction(this.pointer, container.use()),
    );
    return new Transaction(container.get());
  }

  setOption(
    option: keyof typeof options.NetworkOption,
    value?: number | string,
  ) {
    const optionData = options.NetworkOption[option];
    if (!optionData) {
      throw new Error("Invalid option");
    }
    const [optionId, optionValueType] = optionData;
    let valuePointer: Deno.PointerValue = null;
    let valueLength = 0;
    if (optionValueType === "Int") {
      if (typeof value !== "number" || !Number.isInteger(value)) {
        throw new TypeError("Invalid integer value argument");
      }
      // Prefer Uint8Array due to Deno FFI preference on it.
      const u8array = new Uint8Array(8);
      const view = new DataView(u8array.buffer);
      view.setBigInt64(0, BigInt(value), true);
      valuePointer = Deno.UnsafePointer.of(u8array);
      valueLength = 8;
    } else if (optionValueType === "String") {
      if (typeof value !== "string") {
        throw new TypeError("Invalid string value argument");
      }
      // No need to create a CString (ie. add null byte) due to length parameter
      const stringBuffer = new TextEncoder().encode(value);
      valuePointer = Deno.UnsafePointer.of(stringBuffer);
      valueLength = stringBuffer.length;
    }
    checkFDBErr(lib.fdb_database_set_option(
      this.pointer,
      optionId,
      valuePointer,
      valueLength,
    ));
  }

  openTenant(name: string) {
    const container = new PointerContainer();
    checkFDBErr(lib.fdb_database_open_tenant(
      this.pointer,
      encodeCString(name),
      name.length,
      container.use(),
    ));
    return new Tenant(container.get());
  }
}
