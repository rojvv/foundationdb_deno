import { lib } from "./lib.ts";
import { checkFDBErr, encodeCString, PointerContainer } from "./utils.ts";
import { Database } from "./database.ts";

export function selectAPIVersion(apiVersion: number, headerVersion?: number) {
  headerVersion ??= apiVersion;
  checkFDBErr(lib.fdb_select_api_version_impl(apiVersion, headerVersion));
}

export async function startNetwork() {
  checkFDBErr(lib.fdb_setup_network());
  checkFDBErr(await lib.fdb_run_network());
}

export function stopNetwork() {
  checkFDBErr(lib.fdb_stop_network());
}

export function createDatabase(clusterFile: string | null = null) {
  const container = new PointerContainer();
  checkFDBErr(lib.fdb_create_database(
    clusterFile == null ? clusterFile : encodeCString(clusterFile),
    container.use(),
  ));
  return new Database(container.get());
}
