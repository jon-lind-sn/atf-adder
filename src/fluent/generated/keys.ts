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
                    'add-test-suite-to-update-set-bulk': {
                        table: 'sys_ui_action'
                        id: 'c26a069f16a8416a9679492bc2243228'
                    }
                    'add-test-to-update-set': {
                        table: 'sys_ui_action'
                        id: '44e7c05d3cf24822a3defed21b07f879'
                    }
                    'add-test-to-update-set-bulk': {
                        table: 'sys_ui_action'
                        id: '98f1c02863bf4a7783e0da04c2d89b57'
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
                    verify_add_test_suite_to_update_set: {
                        table: 'sys_atf_test'
                        id: 'b41029b8954446448e2dfb909e71e93d'
                    }
                    verify_add_test_suite_to_update_set_script: {
                        table: 'sys_atf_step'
                        id: '792fa8a144184717871ad7998dcb7d04'
                    }
                    verify_add_test_to_update_set: {
                        table: 'sys_atf_test'
                        id: 'f14f6da51e85432ea792eb2fa4338424'
                    }
                    verify_add_test_to_update_set_script: {
                        table: 'sys_atf_step'
                        id: '927d38ff04844114bf137391c05f91b7'
                    }
                }
                composite: [
                    {
                        table: 'sys_element_mapping'
                        id: '004b86e412ed4dc19f984c24713bd86f'
                        key: {
                            id: '927d38ff04844114bf137391c05f91b7'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '2929bfc218164a87b8c54aca57a14592'
                        key: {
                            document_key: '792fa8a144184717871ad7998dcb7d04'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '33c9f908d4f148edbd2de5404495f1e1'
                        key: {
                            document_key: '927d38ff04844114bf137391c05f91b7'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: '43cff781e3c745f1a35176b0b68b6179'
                        key: {
                            id: '792fa8a144184717871ad7998dcb7d04'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '99c56bdc7bc243d787a56f168e3f4872'
                        key: {
                            document_key: '927d38ff04844114bf137391c05f91b7'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'd76b427dd9154160ba4665a9483c243b'
                        key: {
                            document_key: '792fa8a144184717871ad7998dcb7d04'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                ]
            }
        }
    }
}
