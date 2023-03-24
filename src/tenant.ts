import { lib } from "./lib.ts";
import { checkFDBErr, PointerContainer } from "./utils.ts";
import { Transaction } from "./transaction.ts";

export class Tenant {
  constructor(private pointer: NonNullable<Deno.PointerValue>) {
  }

  createTransaction() {
    const container = new PointerContainer();
    checkFDBErr(
      lib.fdb_tenant_create_transaction(this.pointer, container.use()),
    );
    return new Transaction(container.get());
  }

  destroy() {
    lib.fdb_tenant_destroy(this.pointer);
  }
}
