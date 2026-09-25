# AGENTS.md — atf-adder

## Purpose

A globally-scoped ServiceNow Fluent (`@servicenow/sdk`) app. Goal: let a developer
open an ATF Test or ATF Test Suite and, from a UI Action button, capture it (and
everything it depends on) into the currently selected update set — replicating the
manual process of opening the test/suite, each child test, and each test step and
making a trivial edit to force each one into the update set.

Manual process being replaced (see original ask):
1. Create an update set and make it current.
2. Open the ATF test or suite and make a minor change (e.g. add a character to description).
3. If a suite: open each child test and make another minor change.
4. Open each test step in the ATF test(s) and make a minor change to each.
5. Verify all the steps have been captured in the update set.
6. (Out of scope for this app) Mark the update set complete, move to target instance, commit.

Step 6 is explicitly NOT automated — see decisions below.

This manual process is the official ServiceNow workaround documented in
**KB0825608 — "Capture an existing ATF Test or Suite in a new update set"**
(https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0825608).
The app is an automation of that KB. The KB gives two methods:
- **Method 1** — make a minor change to the test/suite, to each child test (for a
  suite), and to *each test step*; verify capture; complete/move/commit.
- **Method 2** — with an update set current, use the OOB "Copy Test" / "Copy Test
  Suite" button, which captures the (copied) test/suite and all its steps at once.
  This creates new copied records rather than capturing the originals.

**KB caveat — custom step configs:** the KB explicitly notes that custom step
configurations (`sys_atf_step_config`) must be captured separately if required.
OOB step configs already exist on the target; customer-defined ones do not travel
unless added to the update set. This is a live concern — any number of custom step
types could need special handling, and the current implementation does not capture
`sys_atf_step_config` at all.

**Empirically confirmed on `xare` (2026-09-25):** editing only the parent test
(`sys_atf_test` 9a1cbbf05330220002c6435723dc34fb, "Server Side Script") produced
exactly ONE `sys_update_xml` — the test — and its payload carried only a
`sys_variable_value action="delete_multiple"` keyed to the *test's* sys_id. The 3
`sys_atf_step` children and their step-keyed `sys_variable_value` inputs (User,
Test script, Jasmine version) were NOT captured. `sys_variable_value` is a data
table, not tracked metadata; it only enters an update set as a delete_multiple+insert
block attached to whichever metadata record you actually edit. Hence each step must
be edited individually.

## Global scope = ES5 only for Script Includes (2026-09-25)

This instance compiles **global scope at ES Level 0 (legacy Rhino)** even though the
app is `js_level = es_latest`. So server-side Script Include `.js` files
(`src/server/script-includes/*.js`) **must be written in ES5**: no arrow functions,
no `const`/`let`, no object-literal shorthand (`{ x }`), no template literals — use
`var`, `function () {}`, and explicit `{ x: x }`. This is confirmed, not theoretical:
`AtfAddToUpdateSet` was originally written in ES6 and failed to compile
(`missing : after property id ... Script ES Level: 0` on the shorthand at the return
statements). A failed Script Include compile does NOT surface as a syntax error at
the call site — it surfaces downstream as `"AtfAddToUpdateSet" is not defined`, which
is what made the UI Actions silently capture nothing. Reproduce/verify a compile with
`sys.scripts.modern.do`: `var x = new AtfAddToUpdateSet(); gs.info(x.type);`.
(This reinforces the UI Action convention below — those are already classic ES5.)

## Scope guard disabled (2026-09-25 — revisit later)

`AtfAddToUpdateSet`'s `scopeMismatchMessage` guard is currently **disabled**
(short-circuited to `return null`; the original body is left below it for
reference). It was the reason the UI Actions captured *nothing*: it compared the
record's `sys_scope` (an out-of-box Global ATF test resolves to the literal string
`"global"`) against `gs.getCurrentApplicationId()` (this app, "ATF Adder", whose
app sys_id is `c3e474398731471d9c817d4c20087e92`). This app is genuinely global
scope (`sys_scope.scope = "global"`) but is its own application record, distinct
from the OOB "Global" application whose sys_id literally *is* `"global"` — so the
two are never equal for any global ATF test, and every capture bailed with a
"different application scope" error. Verified: running the UI Action produced an
empty update set (`74432265c32307509a1f993ed4013198`).

The guard was also conceptually wrong: update sets track by scope *string*
("global"), which "ATF Adder" and OOB "Global" share, so they resolve to the same
current global update set — comparing application sys_ids was never the right test.
A correct future guard should resolve the record's `sys_scope.scope` string and
confirm a current update set exists for it, then let `verifyCapture` report reality.

**Consequence for testing:** the earlier "touch" test told us nothing about whether
`setForceUpdate(true); update()` carries the embedded `sys_variable_value` /
`sys_element_mapping` dependents — the code exited before the first `.update()`.
Re-test that only after rebuilding/redeploying with the guard disabled.

## Instance / environment

- Target instance: `xare` (`https://xare.service-now.com`).
- Auth aliases are global to the machine (`~/.now-sdk` style store), not per-project.
  `xare` (basic auth, username `jon.lind`) is the **default** alias and is the one
  that actually works for `now-sdk install`'s zip-upload endpoint.
- `xareo` (OAuth, same host) exists but the zip-upload processor used by
  `now-sdk install` does not work with it — install fails with
  "Unable to upload app zip file." Do not switch the default back to `xareo`
  without re-testing install first.
- Set default alias with: `npx @servicenow/sdk auth --use xare`
- `now.config.json` requires `"packageResolverVersion": "2.0.0"` for Global-scope
  apps (the SDK default of `1.0.0` is scoped-app-only and silently fails install
  otherwise, before we found the real cause was auth — both issues were fixed,
  keep both fixes).
- **For ad-hoc record lookups on `xare`, use `npx @servicenow/sdk query <table>
  -q "<encoded query>"` (the now-sdk CLI), not the `sn-universal` MCP tool.**
  `sn-universal` needs an interactive auth elicitation step that this
  environment's transport can't service (`Cannot send 'elicitation/create':
  this transport context has no back-channel for server-initiated requests.`),
  so it fails outright here. `now-sdk query` uses the same already-configured
  `xare` alias and works without any extra prompt. Example:
  `npx @servicenow/sdk query sys_ui_action -q "nameLIKEUpdate Set" -f name,table,order,list_banner_button,list_context_menu --display-value true`.

## Build / deploy

```bash
npm run build    # now-sdk build — compiles src/fluent into dist/app
npm run deploy   # now-sdk install — pushes dist/app to the default aliased instance (xare)
```

Always `npm run build` before `npm run deploy` — install pushes the last build
output, not live source.

## Release procedure ("increment the version and build")

When asked to cut a release — or literally told "increment the version and build" —
do all of the following as one unit, not just the version bump:

1. Bump `version` in `package.json` (this is what becomes the app's `sys_app.version`).
2. `npm run build`.
3. Regenerate the update set XML at the repo root via the `update-set-gen` skill,
   pointed at `dist/app`. Delete the old version's XML first (filename embeds the
   version, e.g. `ATF-Adder-1.0.0.xml`, so a version bump always orphans the old file).
4. Update the update-set link in `README.md` to the new filename.
5. Do not deploy as part of this — deploying is a separate, explicit ask.

## Project layout

```
src/
  fluent/
    generated/keys.ts              # Now.ID -> real sys_id map (see below)
    script-includes/
      atf-add-to-update-set.now.ts # ScriptInclude() Fluent definition
      atf-add-to-update-set.js     # Class.create() logic, referenced via Now.include()
    ui-actions/
      capture-atf.now.ts           # BOTH UiAction() defs (test + suite) in one file
```

Note: the Script Include's `.js` source lives next to its `.now.ts` definition
under `src/fluent/`, not under `src/server/` — see "No `src/server` directory"
below for why.

## No `src/server` directory (by design, 2026-09-25)

`serverModulesDir` (default `src/server`) is scanned by the build and generates a
`sys_module` bookkeeping record on the instance for every file in it, regardless of
how the file is consumed. That's separate from, and in addition to, whatever real
record (`sys_script_include`, `sys_ui_action`, etc.) actually uses the file's content
via `Now.include()`. Since this app has no client-side scripts, HTML, or CSS —
everything is either a module-eligible script (business rules, UI actions — none of
which need an external file, they're short enough to inline) or a string-only script
include — there's no reason to keep any file under `serverModulesDir` at all.

The `AtfAddToUpdateSet` Script Include's `.js` source therefore lives directly next
to its `.now.ts` definition under `src/fluent/script-includes/`, referenced via a
relative `Now.include('./atf-add-to-update-set.js')`. `Now.include()` only requires
the path be relative to the calling `.now.ts` file — it has no dependency on
`serverModulesDir`. This avoids an orphaned `sys_module` record for a file nobody
needs to see on the instance (the real, on-platform-editable artifact is the
`sys_script_include` record itself).

If a future script needs real JS modules (`import`/`export`, typed Glide APIs) for
an API that supports them, put it back under `src/server/` — that's what the
directory is for. The point isn't "never use `src/server`", it's "don't leave files
there that don't need the module machinery."

## How it works (verified 2026-09-25)

The implementation "touches" records directly with
`gr.setForceUpdate(true); gr.update();` on the test/suite, its steps, and (for a
suite) its member tests and the suite/test join records.

**The earlier "open concern" (that `setForceUpdate` might bypass an OOB on-change
cascade and silently miss records) is RESOLVED — disproven empirically.** On
`xare`, clicking "Add Test to Update Set" on test `9a1cbbf05330220002c6435723dc34fb`
("Server Side Script") produced an update set (`74432265…`) whose 4 entries are
**byte-equivalent** (normalizing `sys_updated_on`/`sys_mod_count`/`sys_updated_by`)
to a known-complete *manual* capture of the same test (`d39e9669…`). Two facts were
proven:
1. `setForceUpdate(true); update()` **does** write even with no field change (test
   `sys_mod_count` went 3→4).
2. The platform's own (compiled, black-box) serializer folds the two non-metadata
   dependent tables — `sys_variable_value` and `sys_element_mapping` — into each
   parent test/step payload automatically on that forced update. **We never write
   those two tables ourselves**, and must not try to reproduce the per-step-config
   cleanup `query` variance the serializer emits.

So the app's only job is to force each **metadata** record (test + every step; for
suites also the suite + each `sys_atf_test_suite_test` join + member tests + nested
`parent` suites) to be captured; the dependents ride along.

## Testing status

- **Single-test path: VERIFIED** (see above) on `xare`, 2026-09-25.
- **Suite path: VERIFIED** on `xare`, 2026-09-25. Ran "Add Test Suite to Update
  Set" on **"Mixed Test Suite"** (`sys_atf_test_suite` `3872dfd00b20220050192f15d6673a76`,
  which nests child suite "Child G") → update set `d84a6e69c36307509a1f993ed40131ef`
  with **24 entries = the complete expected graph** (2 suites, 3 `sys_atf_test_suite_test`
  joins, 3 member tests, 16 steps), zero missing/extra, nesting recursed correctly.
  Dependents ride along in test/step payloads as on the single-test path; **suites
  and joins carry no `sys_variable_value`/`sys_element_mapping` dependents** — so the
  earlier open unknown there is answered (nothing to miss).
- **Custom step configs (`sys_atf_step_config`): NOT handled** — see KB caveat
  above; customer-defined step configs won't travel unless captured separately.

## ATF tests for the capture logic (2026-09-25)

`src/fluent/tests/capture-atf.now.ts` defines two ATF tests — **"Verify Add Test
to Update Set"** and **"Verify Add Test Suite to Update Set"** — that exercise
`AtfAddToUpdateSet` directly via `atf.server.runServerSideScript` (per the ATF
guide: a Script Include has no UI, so it's tested this way, not through
`atf.form`/`atf.catalog`). Each test creates its own scratch test/step (and,
for the suite test, suite + join) and its own scratch update set scoped to
`gs.getCurrentApplicationId()`, points the session at it, runs
`addTestToUpdateSet`/`addTestSuiteToUpdateSet`, and asserts the record counts
and zero-missing via `assertEqual`. Run them with:
`npx @servicenow/sdk cicd test run --test-name "<test name>"`.

Two things that weren't obvious while building these, worth remembering:

- **`sys_atf_step` has a mandatory `step_config` field.** Inserting a step
  without it doesn't throw — it fails as a silent Data Policy Exception, so
  the insert never actually happens and `addTestToUpdateSet` only touches the
  test. Use the OOB "Run Server Side Script" step config
  (`41de4a935332120028bc29cac2dc349a`) for scratch steps in tests.
- **Don't manually clean up scratch records in a `finally` block.** ATF
  already wraps each test run in its own metadata rollback context
  (`ATFRollbackUtil`/`RollbackRecorder`) that automatically undoes every
  metadata insert/update made during the run — including scratch
  test/step/suite/join/update-set records and the `sys_update_xml` entries the
  capture itself creates. Manually deleting those collides with that rollback
  (NullPointerExceptions trying to delete rows the recorder is also tracking).
  The only thing the rollback doesn't touch is the `sys_update_set` **user
  preference** — restore that yourself in `finally` via
  `gs.getUser().savePreference('sys_update_set', originalPreference || '')`.

## Adopted vs. new records

- `AtfAddToUpdateSet` (Script Include) and "Add Test to Update Set" (UI Action on
  `sys_atf_test`) were originally real records already on `xare`
  (`cd6f5459970f7a10c24e7d56f053afd3` and `b1c5c1959783ba10c24e7d56f053af1f`).
  Per explicit instruction, this project does **not** pin those old sys_ids —
  `keys.ts` was left to generate fresh sys_ids via normal `Now.ID` behavior. The
  old originals on the instance are separate, orphaned records that jon.lind said
  he'd remove himself.
- "Add Test Suite to Update Set" (UI Action on `sys_atf_test_suite`) is a brand
  new record with no prior on-instance history.

## Conventions used here

- Fluent source files must end in `.now.ts` (not just `.ts`) to be picked up by
  the build.
- UI Action scripts are classic string scripts via `Now.include()`, not JS
  modules — this keeps `action.setRedirectURL(current)` available, which isn't
  exposed to module-style UiAction scripts `(current, params) => void`.
- Script Include class files never import Glide APIs (auto-available in that
  context); modules that aren't Script Includes must import them from
  `@servicenow/glide`.
