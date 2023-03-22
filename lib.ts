let filename = Deno.env.get("LIBFDB_C");
if (!filename) {
  if (Deno.build.os == "darwin") {
    filename = "/usr/local/lib/libfdb_c.dylib";
  } else if (Deno.build.os == "linux") {
    filename = "/usr/lib/libfdb_c.so";
  } else {
    throw new Error(
      "The LIBFDB_C variable was not set and could not automatically resolve the path to libfdb_c",
    );
  }
}

export const { symbols: lib } = Deno.dlopen(filename, {
  fdb_select_api_version_impl: { parameters: ["i32", "i32"], result: "i32" },
  fdb_get_error: { parameters: ["i32"], result: "buffer" },
  fdb_error_predicate: { parameters: ["i32", "i32"], result: "i32" },
  fdb_setup_network: { parameters: [], result: "i32" },
  fdb_network_set_option: {
    parameters: ["i32", "pointer", "i32"],
    result: "i32",
  },
  fdb_run_network: { parameters: [], result: "i32", nonblocking: true },
  fdb_stop_network: { parameters: [], result: "i32" },
  fdb_future_destroy: { parameters: ["pointer"], result: "void" },
  fdb_future_release_memory: { parameters: ["pointer"], result: "void" },
  fdb_future_cancel: { parameters: ["pointer"], result: "void" },
  fdb_future_block_until_ready: { parameters: ["pointer"], result: "i32" },
  fdb_future_is_ready: { parameters: ["pointer"], result: "i32" },
  fdb_future_set_callback: {
    parameters: ["pointer", "pointer", "pointer"],
    result: "i32",
  },
  fdb_future_get_error: { parameters: ["pointer"], result: "i32" },
  fdb_future_get_int64: { parameters: ["pointer", "pointer"], result: "i32" },
  fdb_future_get_uint64: { parameters: ["i32", "pointer"], result: "i32" },
  fdb_future_get_key: {
    parameters: ["pointer", "pointer", "pointer"],
    result: "i32",
  },
  fdb_future_get_value: {
    parameters: ["pointer", "pointer", "pointer", "pointer"],
    result: "i32",
  },
  fdb_future_get_keyvalue_array: {
    parameters: ["pointer", "pointer", "pointer", "pointer"],
    result: "i32",
  },
  fdb_future_get_key_array: {
    parameters: ["pointer", "pointer", "pointer"],
    result: "i32",
  },
  fdb_future_get_string_array: {
    parameters: ["pointer", "pointer", "pointer"],
    result: "i32",
  },
  fdb_create_database: {
    parameters: ["buffer", "pointer"],
    result: "i32",
  },
  fdb_database_destroy: {
    parameters: ["pointer"],
    result: "void",
  },
  fdb_database_open_tenant: {
    parameters: ["pointer", "buffer", "i32", "pointer"],
    result: "i32",
  },
  fdb_database_create_transaction: {
    parameters: ["pointer", "pointer"],
    result: "i32",
  },
  fdb_database_set_option: {
    parameters: [
      "pointer",
      "i32",
      "buffer",
      "i32",
    ],
    result: "i32",
  },
  fdb_tenant_destroy: {
    parameters: ["pointer"],
    result: "void",
  },
  fdb_tenant_create_transaction: {
    parameters: ["pointer", "pointer"],
    result: "i32",
  },
  fdb_transaction_destroy: {
    parameters: ["pointer"],
    result: "void",
  },
  fdb_transaction_cancel: {
    parameters: ["pointer"],
    result: "void",
  },
  fdb_transaction_set_read_version: {
    parameters: ["pointer", "i64"],
    result: "void",
  },
  fdb_transaction_get_read_version: {
    parameters: ["pointer"],
    result: "pointer",
  },
  fdb_transaction_get: {
    parameters: ["pointer", "buffer", "i32", "i32"],
    result: "pointer",
  },
  fdb_transaction_get_key: {
    parameters: ["pointer", "pointer", "i32", "i32", "i32", "i32"],
    result: "pointer",
  },
  fdb_transaction_get_range: {
    parameters: [
      "pointer",
      "pointer",
      "i32",
      "i32",
      "i32",
      "pointer",
      "i32",
      "i32",
      "i32",
      "i32",
      "i32",
      "i32",
      "i32",
      "i32",
      "i32",
    ],
    result: "pointer",
  },
  fdb_transaction_get_estimated_range_size_bytes: {
    parameters: [
      "pointer",
      "pointer",
      "i32",
      "pointer",
      "i32",
    ],
    result: "pointer",
  },
  fdb_transaction_get_range_split_points: {
    parameters: ["pointer", "pointer", "i32", "pointer", "i32", "i32"],
    result: "pointer",
  },
  fdb_transaction_add_conflict_range: {
    parameters: ["pointer", "pointer", "i32", "pointer", "i32", "i32"],
    result: "i32",
  },
  fdb_transaction_get_addresses_for_key: {
    parameters: ["pointer", "pointer", "i32"],
    result: "pointer",
  },
  fdb_transaction_set_option: {
    parameters: ["pointer", "i32", "pointer", "i32"],
    result: "i32",
  },
  fdb_transaction_atomic_op: {
    parameters: ["pointer", "pointer", "i32", "pointer", "i32", "i32"],
    result: "void",
  },
  fdb_transaction_set: {
    parameters: ["pointer", "buffer", "i32", "pointer", "i32"],
    result: "void",
  },
  fdb_transaction_clear: {
    parameters: ["pointer", "pointer", "i32"],
    result: "void",
  },
  fdb_transaction_clear_range: {
    parameters: ["pointer", "pointer", "i32", "pointer", "i32"],
    result: "void",
  },
  fdb_transaction_watch: {
    parameters: ["pointer", "pointer", "i32"],
    result: "pointer",
  },
  fdb_transaction_commit: {
    parameters: ["pointer"],
    result: "pointer",
  },
  fdb_transaction_get_committed_version: {
    parameters: ["pointer", "pointer"],
    result: "i32",
  },
  fdb_transaction_get_approximate_size: {
    parameters: ["pointer"],
    result: "pointer",
  },
  fdb_transaction_get_versionstamp: {
    parameters: ["pointer"],
    result: "pointer",
  },
  fdb_transaction_on_error: {
    parameters: ["pointer", "i32"],
    result: "pointer",
  },
  fdb_transaction_reset: {
    parameters: ["pointer"],
    result: "pointer",
  },
});
