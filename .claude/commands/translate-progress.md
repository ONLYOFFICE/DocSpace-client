# Translation progress check

Show how many locale keys are still missing across all workspaces.

## Step 1 — run the tests

```bash
cd common/tests && npx vitest run test/locales.test.js 2>&1
```

## Step 2 — parse and summarize

From the output, extract all `NotTranslatedOnBaseLanguages` failures and count:

- Total failing languages
- Total failing keys per language
- List of unique missing keys

## Step 3 — cross-check all languages (not just base)

For each unique missing key found in Step 2, resolve its namespace file path using this table:

| Namespace | Path |
|-----------|------|
| `Common` | `public/locales/{lang}/Common.json` |
| `Settings`, `Services`, `Payments` | `packages/client/public/locales/{lang}/Settings.json` etc. |
| *everything else* | `packages/client/public/locales/{lang}/{Namespace}.json` |

Then run a quick Python check across **all** supported languages to see which ones are missing those keys:

```python
import json, os

keys   = [...]   # unique missing keys from Step 2
ns_dir = "..."   # resolved locales dir for the namespace

langs = sorted([d for d in os.listdir(ns_dir) if os.path.isdir(os.path.join(ns_dir, d)) and not d.startswith('.')])
for lang in langs:
    f = os.path.join(ns_dir, lang, f"{namespace}.json")
    if not os.path.exists(f):
        continue
    with open(f) as fh:
        data = json.load(fh)
    missing = [k for k in keys if k not in data]
    status = f"✓ done" if not missing else f"✗ missing {len(missing)}"
    print(f"{lang:15s} {status}")
```

## Step 4 — report

Print a summary table:

```
Namespace: Settings  (19 keys)

Language        Status
──────────────────────────────
ar-SA           ✗ missing 19
az              ✗ missing 19
bg              ✓ done
cs              ✗ missing 3
de              ✓ done
...

Done: 8 / 31   Pending: 23
```

If all languages are complete, print: **All translations complete.**
