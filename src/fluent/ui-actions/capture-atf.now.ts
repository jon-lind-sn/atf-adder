import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'

export const captureAtfTestAction = UiAction({
    $id: Now.ID['add-test-to-update-set'],
    table: 'sys_atf_test',
    name: 'Add Test to Update Set',
    actionName: 'add_test_to_update_set',
    showInsert: false,
    showUpdate: true,
    showMultipleUpdate: true,
    form: {
        showLink: true,
    },
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
    name: 'Add Test Suite to Update Set',
    actionName: 'add_test_suite_to_update_set',
    showInsert: false,
    showUpdate: true,
    showMultipleUpdate: true,
    form: {
        showLink: true,
    },
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
