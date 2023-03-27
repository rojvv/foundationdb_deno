import { lib } from "./lib.ts";
import { checkFDBErr, PointerContainer } from "./utils.ts";
import { Transaction } from "./transaction.ts";

export class Tenant {
  private static FINALIZATION_REGISTRY = new FinalizationRegistry(
    (pointer: NonNullable<Deno.PointerValue>) => {
      lib.fdb_tenant_destroy(pointer);
    },
  );

  constructor(private pointer: NonNullable<Deno.PointerValue>) {
    Tenant.FINALIZATION_REGISTRY.register(this, pointer);
  }

  createTransaction() {
    const container = new PointerContainer();
    checkFDBErr(
      lib.fdb_tenant_create_transaction(this.pointer, container.use()),
    );
    return new Transaction(container.get());
  }
}
