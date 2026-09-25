# atf-adder

## Why

There's no reliable out-of-box way to capture an existing Automated Test Framework
(ATF) Test or Suite into an update set. The supported workaround is manual and
tedious. See [KB0825608 — Capture an existing ATF Test or Suite in a new update
set](https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0825608).

This tool automates the basic funcitonality, but does not actual change the files as described in the KB.

## What it does

Adds links ATF Test and ATF Test Suite forms. Using it will add the current record and its dependencies to the currently selected update set.

## How to use it

1. Make an update set current, matching the scope of the test/suite you're capturing.
2. Open the ATF Test or Test Suite.
3. Use the link. You'll get a message confirming what was captured, or an error
   if something didn't make it in (e.g. wrong update set scope selected).

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
