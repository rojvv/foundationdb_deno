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
    checkFDBErr(lib.fdb_database_set_option(
      this.pointer,
      Object.fromEntries(
        Object.values(options)
          .map((v) => Object.entries(v))
          .flat(),
      )[option][0] as number,
      value == undefined
        ? null
        : typeof value === "number"
        ? new Uint8Array(value)
        : encodeCString(value),
      typeof value === "number" ? 8 : 1,
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
