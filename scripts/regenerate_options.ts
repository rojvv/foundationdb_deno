// deno-lint-ignore-file no-explicit-any
import { xml2js } from "https://deno.land/x/xml2js@1.0.0/mod.ts";

const url =
  "https://raw.githubusercontent.com/apple/foundationdb/main/fdbclient/vexillographer/fdb.options";

const response = await fetch(url);

const text = await response.text();

const { elements } = xml2js(text, {}) as any;

const initializer: any = {};

for (const element of elements) {
  if (element.name == "Options") {
    for (const element_ of element.elements) {
      if (element_.name == "Scope") {
        for (const element__ of element_.elements) {
          if (element__.name == "Option") {
            const paramType = element__.attributes.paramType ?? "None";

            initializer[element_.attributes.name] ??= {};
            initializer[element_.attributes.name][
              element__.attributes.name.toUpperCase()
            ] = [Number(element__.attributes.code), paramType];
          }
        }
      }
    }
  }
}

Deno.writeTextFile(
  "src/options.ts",
  `// This file was generated. It is not recommended to manually modify.
// deno-lint-ignore-file
// deno-fmt-ignore-file
export const options = ${JSON.stringify(initializer)};
`,
);
