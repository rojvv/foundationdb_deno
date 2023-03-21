import { lib } from "./lib.ts";
import { checkFDBErr, encodeCString, PointerContainer } from "./utils.ts";
import { Transaction } from "./transaction.ts";
import { Tenant } from "./tenant.ts";

export const options = {
  string: {
    MACHINE_ID: [21, "string"],
    DATACENTER_ID: [22, "string"],
  },
  number: {
    LOCATION_CACHE_SIZE: [10, "number"],
    MAX_WATCHES: [20, "number"],
    TRANSACTION_LOGGING_MAX_FIELD_LENGTH: [405, "number"],
    TRANSACTION_TIMEOUT: [500, "number"],
    TRANSACTION_RETRY_LIMIT: [501, "number"],
    TRANSACTION_MAX_RETRY_DELAY: [502, "number"],
    TRANSACTION_SIZE_LIMIT: [503, "number"],
  },
  noParam: {
    SNAPSHOT_RYW_ENABLE: [26, "undefined"],
    SNAPSHOT_RYW_DISABLE: [27, "undefined"],
    TRANSACTION_CAUSAL_READ_RISKY: [504, "undefined"],
    TRANSACTION_INCLUDE_PORT_IN_ADDRESS: [505, "undefined"],
    TRANSACTION_BYPASS_UNREADABLE: [700, "undefined"],
    USE_CONFIG_DATABASE: [800, "undefined"],
    TEST_CAUSAL_READ_RISKY: [900, "undefined"],
  },
};

const FLAT_OPTIONS = {
  ...options.string,
  ...options.number,
  ...options.noParam,
};

export class Database {
  constructor(private pointer: NonNullable<Deno.PointerValue>) {
  }

  createTransaction() {
    const container = new PointerContainer();
    checkFDBErr(
      lib.fdb_database_create_transaction(this.pointer, container.use()),
    );
    return new Transaction(container.get());
  }

  destroy() {
    lib.fdb_database_destroy(this.pointer);
  }

  setOption(option: keyof (typeof options)["number"], value: number): void;
  setOption(option: keyof (typeof options)["string"], value: string): void;
  setOption(option: keyof (typeof options)["noParam"]): void;
  setOption(option: string, value?: number | string) {
    const optionData = FLAT_OPTIONS[option];
    if (!optionData) {
      throw new Error("Invalid option");
    }
    const [optionId, optionValueType] = optionData;
    let valuePointer: Deno.PointerValue = null;
    let valueLength = 0;
    if (optionValueType === "number") {
      if (typeof value !== "number" || !Number.isInteger(value)) {
        throw new TypeError("Invalid integer value argument");
      }
      // Prefer Uint8Array due to Deno FFI preference on it.
      const u8array = new Uint8Array(8);
      const view = new DataView(u8array.buffer);
      view.setBigInt64(0, BigInt(value), true);
      valuePointer = Deno.UnsafePointer.of(u8array);
      valueLength = 8;
    } else if (optionValueType === "string") {
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
      FLAT_OPTIONS[option][0] as number,
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
