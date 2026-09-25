import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'

export const captureAtfTestAction = UiAction({
    $id: Now.ID['add-test-to-update-set'],
    table: 'sys_atf_test',
    name: 'Add Test to Update Set',
    actionName: 'add_test_to_update_set',
    order: 100,
    hint: 'Capture this test and its steps in the current update set.',
    showInsert: false,
    showUpdate: true,
    showMultipleUpdate: false,
    form: {
        showLink: true,
    },
    script: `(function () {
    var atu = new AtfAddToUpdateSet();
    var result = atu.addTestToUpdateSet(current);

    if (result.success) {
        gs.addInfoMessage(result.message);
    } else {
        gs.addErrorMessage(result.message);
    }

    action.setRedirectURL(GlideSession.get().getStack().bottom());
})();`,
})

export const captureAtfTestActionBulk = UiAction({
    $id: Now.ID['add-test-to-update-set-bulk'],
    table: 'sys_atf_test',
    name: 'Add Tests to Update Set',
    actionName: 'add_test_to_update_set',
    order: 99,
    hint: 'Capture the selected tests and their steps in the current update set.',
    showInsert: false,
    showUpdate: true,
    showMultipleUpdate: true,
    condition: `new AtfAddToUpdateSet().isScopeMatch(current)`,
    list: {
        showContextMenu: true,
        showListChoice: true,
    },
    script: `(function () {
    var atu = new AtfAddToUpdateSet();
    var result = atu.addTestToUpdateSet(current);

    if (result.success) {
        gs.addInfoMessage(result.message);
    } else {
        gs.addErrorMessage(result.message);
    }

    action.setRedirectURL(GlideSession.get().getStack().bottom());
})();`,
})

export const captureAtfTestSuiteAction = UiAction({
    $id: Now.ID['add-test-suite-to-update-set'],
    table: 'sys_atf_test_suite',
    name: 'Add Suite to Update Set',
    actionName: 'add_test_suite_to_update_set',
    order: 100,
    hint: 'Capture this suite and its tests in the current update set.',
    showInsert: false,
    showUpdate: true,
    showMultipleUpdate: false,
    form: {
        showLink: true,
    },
    script: `(function () {
    var atu = new AtfAddToUpdateSet();
    var result = atu.addTestSuiteToUpdateSet(current);

    if (result.success) {
        gs.addInfoMessage(result.message);
    } else {
        gs.addErrorMessage(result.message);
    }

    action.setRedirectURL(GlideSession.get().getStack().bottom());
})();`,
})

export const captureAtfTestSuiteActionBulk = UiAction({
    $id: Now.ID['add-test-suite-to-update-set-bulk'],
    table: 'sys_atf_test_suite',
    name: 'Add Suites to Update Set',
    actionName: 'add_test_suite_to_update_set',
    order: 99,
    hint: 'Capture the selected suites and their tests in the current update set.',
    showInsert: false,
    showUpdate: true,
    showMultipleUpdate: true,
    condition: `new AtfAddToUpdateSet().isScopeMatch(current)`,
    list: {
        showContextMenu: true,
        showListChoice: true,
    },
    script: `(function () {
    var atu = new AtfAddToUpdateSet();
    var result = atu.addTestSuiteToUpdateSet(current);

    if (result.success) {
        gs.addInfoMessage(result.message);
    } else {
        gs.addErrorMessage(result.message);
    }

    action.setRedirectURL(GlideSession.get().getStack().bottom());
})();`,
})
