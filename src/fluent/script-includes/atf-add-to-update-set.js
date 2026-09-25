var AtfAddToUpdateSet = Class.create();
// NOTE: This runs in GLOBAL scope, which this instance compiles at ES Level 0
// (legacy Rhino) regardless of the app's js_level=es_latest. Keep this file ES5:
// no arrow functions, no const/let, no object shorthand. See AGENTS.md.
AtfAddToUpdateSet.prototype = (function () {
    function touchRecord(gr, touched) {
        gr.setForceUpdate(true);
        gr.update();
        touched.push(gr.getTableName() + '_' + gr.getUniqueValue());
        return 1;
    }

    function getRecord(grOrSysId, tableName) {
        if (grOrSysId instanceof GlideRecord) {
            return grOrSysId;
        }
        var gr = new GlideRecord(tableName);
        gr.get(grOrSysId);
        return gr;
    }

    function scopeMismatchMessage(gr) {
        // Compares the record's sys_scope reference directly against the
        // CURRENT UPDATE SET's application reference (sys_update_set.application) --
        // both point at sys_scope and use the same literal "global" sys_id for
        // globally scoped records/update sets, so no dereferencing is needed.
        // This replaces the earlier, disabled guard that mistakenly compared the
        // record's sys_scope against gs.getCurrentApplicationId() (this app's own
        // scope, "ATF Adder"), which could never match an OOB-Global ATF test.
        var recordScope = gr.getValue('sys_scope');
        if (!recordScope) {
            return null;
        }

        var updateSetId = gs.getPreference('sys_update_set');
        if (!updateSetId) {
            // No update set selected at all -- let verifyCapture's normal
            // missing-record reporting surface that, rather than duplicating it here.
            return null;
        }

        var updateSetGr = new GlideRecord('sys_update_set');
        if (!updateSetGr.get(updateSetId)) {
            return null;
        }

        if (updateSetGr.getValue('application') === recordScope) {
            return null;
        }

        return gs.getMessage('Cannot capture "{0}" ({1}) because it belongs to a different application scope ' +
            "than the one currently selected. Switch your application scope to match this record's scope, so " +
            'its update set is selected, and try again.', [gr.getDisplayValue(), gr.getTableName()]);
    }

    function collectTest(testGrOrSysId, touched) {
        var atfTest = getRecord(testGrOrSysId, 'sys_atf_test');

        var recordsTouched = touchRecord(atfTest, touched);

        var steps = new GlideRecord('sys_atf_step');
        steps.addQuery('test', atfTest.getUniqueValue());
        steps.query();
        while (steps.next()) {
            recordsTouched += touchRecord(steps, touched);
        }

        return recordsTouched;
    }

    function collectSuite(suiteGrOrSysId, touched) {
        var atfSuite = getRecord(suiteGrOrSysId, 'sys_atf_test_suite');

        var suiteSysId = atfSuite.getUniqueValue();
        var recordsTouched = touchRecord(atfSuite, touched);

        var suiteTests = new GlideRecord('sys_atf_test_suite_test');
        suiteTests.addQuery('test_suite', suiteSysId);
        suiteTests.query();
        while (suiteTests.next()) {
            recordsTouched += touchRecord(suiteTests, touched);
            recordsTouched += collectTest(suiteTests.test.getRefRecord(), touched);
        }

        // Suites can nest inside other suites (sys_atf_test_suite.parent) -- capture those too.
        var childSuites = new GlideRecord('sys_atf_test_suite');
        childSuites.addQuery('parent', suiteSysId);
        childSuites.query();
        while (childSuites.next()) {
            recordsTouched += collectSuite(childSuites, touched);
        }

        return recordsTouched;
    }

    function verifyCapture(touched) {
        var updateSetId = gs.getPreference('sys_update_set');
        if (!updateSetId || touched.length === 0) {
            return { updateSetId: updateSetId, missing: touched.slice() };
        }

        var found = {};
        var gr = new GlideRecord('sys_update_xml');
        gr.addQuery('update_set', updateSetId);
        gr.addQuery('name', 'IN', touched.join(','));
        gr.addQuery('action', '!=', 'DELETE');
        gr.query();
        while (gr.next()) {
            found[gr.getValue('name')] = true;
        }

        var missing = touched.filter(function (key) {
            return !found[key];
        });
        return { updateSetId: updateSetId, missing: missing };
    }

    function resultMessage(success, recordsTouched, missing) {
        // gs.getMessage() renders a bare JS number argument via Java number
        // formatting (e.g. 24 -> "24.0") -- pass counts as strings instead.
        if (success) {
            return gs.getMessage('Added {0} record(s) to the current update set.', [String(recordsTouched)]);
        }
        return gs.getMessage('Captured {0} record(s), but {1} did not make it into the current update set. ' +
            'Check your update set selection.', [String(recordsTouched), String(missing.length)]);
    }

    function addTestToUpdateSet(testGrOrSysId) {
        var atfTest = getRecord(testGrOrSysId, 'sys_atf_test');

        var mismatch = scopeMismatchMessage(atfTest);
        if (mismatch) {
            return { success: false, message: mismatch, recordsTouched: 0, missing: [] };
        }

        var touched = [];
        var recordsTouched = collectTest(atfTest, touched);
        var verification = verifyCapture(touched);
        var success = verification.missing.length === 0;

        return {
            success: success,
            message: resultMessage(success, recordsTouched, verification.missing),
            recordsTouched: recordsTouched,
            missing: verification.missing,
        };
    }

    function addTestSuiteToUpdateSet(suiteGrOrSysId) {
        var atfSuite = getRecord(suiteGrOrSysId, 'sys_atf_test_suite');

        var mismatch = scopeMismatchMessage(atfSuite);
        if (mismatch) {
            return { success: false, message: mismatch, recordsTouched: 0, missing: [] };
        }

        var touched = [];
        var recordsTouched = collectSuite(atfSuite, touched);
        var verification = verifyCapture(touched);
        var success = verification.missing.length === 0;

        return {
            success: success,
            message: resultMessage(success, recordsTouched, verification.missing),
            recordsTouched: recordsTouched,
            missing: verification.missing,
        };
    }

    return {
        initialize: function () { },
        addTestToUpdateSet: addTestToUpdateSet,
        addTestSuiteToUpdateSet: addTestSuiteToUpdateSet,
        type: 'AtfAddToUpdateSet',
    };
})();
