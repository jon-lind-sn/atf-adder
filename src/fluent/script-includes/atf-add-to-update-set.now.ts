import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const AtfAddToUpdateSet = ScriptInclude({
    $id: Now.ID['atf-add-to-update-set'],
    name: 'AtfAddToUpdateSet',
    script: Now.include('./atf-add-to-update-set.js'),
    description: 'Adds an ATF Test or Test Suite (and its child tests/steps) to the current update set, after confirming the record is in the currently selected application scope.',
    accessibleFrom: 'public',
    clientCallable: false,
    sandboxCallable: false,
})
