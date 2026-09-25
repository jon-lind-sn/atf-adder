# atf-adder

## Why

There's no reliable out-of-box way to capture an existing Automated Test Framework
(ATF) Test or Suite into an update set. The supported workaround is manual and
tedious. See [KB0825608 — Capture an existing ATF Test or Suite in a new update
set](https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0825608).

This tool automates the basic functionality, but does not actually change the files as described in the KB.

## What it does

Adds a link to the ATF Test and ATF Test Suite forms, and a bulk list choice/context
menu action to the ATF Test and ATF Test Suite lists. Using either will add the
selected record(s) and their dependencies to the currently selected update set.

## How to use it

**On a single record:**

1. Make an update set current, matching the scope of the test/suite you're capturing.
2. Open the ATF Test or Test Suite.
3. Use the `Add Test to Update Set` or `Add Suite to Update Set`. You'll get a message confirming what was captured, or an error if
   something didn't make it in (e.g. wrong update set scope selected).

**On multiple records:**

1. Make an update set current, matching the scope of the tests/suites you're capturing.
2. From the ATF Test or ATF Test Suite list, select the records you want to capture.
3. Use the `Add Tests to Update Set` or `Add Suites to Update Set` choice from "Actions on selected rows...". Only available when the
   selected record(s) match the current update set's scope.

## Testing

The app ships two ATF tests covering the capture logic: "Verify Add Test to
Update Set" and "Verify Add Test Suite to Update Set". Run them from ATF like
any other test, or via the SDK, e.g.:

```bash
npx @servicenow/sdk cicd test run --test-name "Verify Add Test to Update Set"
```

## Install

**Update set:** [`ATF-Adder-1.0.0.xml`](./ATF-Adder-1.0.0.xml) — use retrieved update sets and preview/commit it like any other update set.

**Studio:** Import from Git, pointed at this repo, then build and install the app.

**Local build/deploy:** clone the repo, `npm install`, authenticate the SDK to your
instance (`now-sdk auth`), then `npm run build` and `npm run deploy`.
