# FoundationDB for Deno

```ts
import {
  createDatabase,
  selectAPIVersion,
  startNetwork,
  stopNetwork,
} from "https://deno.land/x/fdb/mod.ts";

selectAPIVersion(710);
startNetwork();

const database = createDatabase();

const transaction = database.openTenant("yourTenant").createTransaction();
const future = transaction.get("yourKey");

future.blockUntilReady(); // or `future.setCallback`

const value = future.getValue();

if (value == null) {
  console.log("Key not found");
} else {
  const string = new TextDecoder().decode(new Uint8Array(value));
  console.log(`yourKey is ${string}`);
}

stopNetwork();
```
