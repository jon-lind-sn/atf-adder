import '@servicenow/sdk/global'
import { Test } from '@servicenow/sdk/core'

// Both tests are self-contained: they create their own scratch ATF test/suite
// records and their own scratch update set (scoped to whatever application the
// test happens to run under), point the session at that update set, and invoke
// AtfAddToUpdateSet directly (per the ATF guide: Script Includes have no UI, so
// exercise them via a server-side script, not atf.form/atf.catalog).
//
// ATF already wraps each test run in its own metadata rollback context
// (ATFRollbackUtil/RollbackRecorder) that automatically undoes every metadata
// insert/update made during the run -- including our scratch test/step/suite/
// join/update-set records and the sys_update_xml entries the capture creates.
// Manually deleting those in a finally block collides with that rollback (it
// throws NPEs trying to delete rows the rollback recorder is also tracking),
// so we don't -- only the "current update set" user preference is restored,
// since preferences aren't part of the rollback context.

export const verifyAddTestToUpdateSet = Test(
    {
        $id: Now.ID['verify_add_test_to_update_set'],
        name: 'Verify Add Test to Update Set',
        description: 'Creates a scratch ATF test + step and a scratch update set in the same scope, runs AtfAddToUpdateSet.addTestToUpdateSet against it, and asserts both records land in the update set.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['verify_add_test_to_update_set_script'],
            jasmineVersion: '3.1',
            script: `
(function (outputs, steps, params, stepResult, assertEqual) {
    var originalPreference = gs.getPreference('sys_update_set');
    var scopeId = gs.getCurrentApplicationId();

    var test = new GlideRecord('sys_atf_test');
    test.initialize();
    test.name = 'ATF Adder scratch test - verifyAddTestToUpdateSet';
    test.insert();

    var step = new GlideRecord('sys_atf_step');
    step.initialize();
    step.test = test.getUniqueValue();
    step.step_config = '41de4a935332120028bc29cac2dc349a'; // OOB "Run Server Side Script" step config
    step.order = 100;
    step.insert();

    var updateSet = new GlideRecord('sys_update_set');
    updateSet.initialize();
    updateSet.name = 'ATF Adder scratch update set - verifyAddTestToUpdateSet';
    updateSet.application = scopeId;
    updateSet.state = 'in progress';
    var updateSetId = updateSet.insert();

    gs.getUser().savePreference('sys_update_set', updateSetId);

    try {
        var atu = new AtfAddToUpdateSet();
        var result = atu.addTestToUpdateSet(test.getUniqueValue());

        assertEqual({ name: 'capture succeeded', shouldbe: true, value: result.success });
        assertEqual({ name: 'records touched (test + step)', shouldbe: 2, value: result.recordsTouched });
        assertEqual({ name: 'missing after capture', shouldbe: 0, value: result.missing.length });

        stepResult.setOutputMessage(result.message);
    } finally {
        gs.getUser().savePreference('sys_update_set', originalPreference || '');
    }
})(outputs, steps, params, stepResult, assertEqual);
`,
        })
    }
)

export const verifyAddTestSuiteToUpdateSet = Test(
    {
        $id: Now.ID['verify_add_test_suite_to_update_set'],
        name: 'Verify Add Test Suite to Update Set',
        description: 'Creates a scratch ATF suite with one member test + step and a scratch update set in the same scope, runs AtfAddToUpdateSet.addTestSuiteToUpdateSet against it, and asserts the suite, join, test and step all land in the update set.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['verify_add_test_suite_to_update_set_script'],
            jasmineVersion: '3.1',
            script: `
(function (outputs, steps, params, stepResult, assertEqual) {
    var originalPreference = gs.getPreference('sys_update_set');
    var scopeId = gs.getCurrentApplicationId();

    var test = new GlideRecord('sys_atf_test');
    test.initialize();
    test.name = 'ATF Adder scratch member test - verifyAddTestSuiteToUpdateSet';
    test.insert();

    var step = new GlideRecord('sys_atf_step');
    step.initialize();
    step.test = test.getUniqueValue();
    step.step_config = '41de4a935332120028bc29cac2dc349a'; // OOB "Run Server Side Script" step config
    step.order = 100;
    step.insert();

    var suite = new GlideRecord('sys_atf_test_suite');
    suite.initialize();
    suite.name = 'ATF Adder scratch suite - verifyAddTestSuiteToUpdateSet';
    suite.insert();

    var join = new GlideRecord('sys_atf_test_suite_test');
    join.initialize();
    join.test_suite = suite.getUniqueValue();
    join.test = test.getUniqueValue();
    join.order = 100;
    join.insert();

    var updateSet = new GlideRecord('sys_update_set');
    updateSet.initialize();
    updateSet.name = 'ATF Adder scratch update set - verifyAddTestSuiteToUpdateSet';
    updateSet.application = scopeId;
    updateSet.state = 'in progress';
    var updateSetId = updateSet.insert();

    gs.getUser().savePreference('sys_update_set', updateSetId);

    try {
        var atu = new AtfAddToUpdateSet();
        var result = atu.addTestSuiteToUpdateSet(suite.getUniqueValue());

        assertEqual({ name: 'capture succeeded', shouldbe: true, value: result.success });
        assertEqual({ name: 'records touched (suite + join + test + step)', shouldbe: 4, value: result.recordsTouched });
        assertEqual({ name: 'missing after capture', shouldbe: 0, value: result.missing.length });

        stepResult.setOutputMessage(result.message);
    } finally {
        gs.getUser().savePreference('sys_update_set', originalPreference || '');
    }
})(outputs, steps, params, stepResult, assertEqual);
`,
        })
    }
)
