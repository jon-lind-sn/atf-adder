import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    'add-test-suite-to-update-set': {
                        table: 'sys_ui_action'
                        id: '665e23b710cd43c7b943ab65da67b8ec'
                    }
                    'add-test-to-update-set': {
                        table: 'sys_ui_action'
                        id: '44e7c05d3cf24822a3defed21b07f879'
                    }
                    'atf-add-to-update-set': {
                        table: 'sys_script_include'
                        id: '23dbd23c0c3f410fb010b2a57a64b0d1'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: '8b5c78b294b941ba89dbdb5db199241f'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '2eda7231e16142bf8e34c42b1b098939'
                    }
                }
            }
        }
    }
}
