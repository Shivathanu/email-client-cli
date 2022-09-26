import inputRules from './apply-rules.json' assert { type: "json" };;
import ManageRules from './engine/manage-rules.js';
import DbConnect from './connector//db-connect.js';
import GmailConnect from './connector/gmail-connect.js';
import _ from 'lodash';

class ApplyRules {
    constructor() {
        this.rules = new ManageRules();
        this.dbConnect = new DbConnect();
        this.gmailConnect = new GmailConnect();
    }

    runRules = async () => {
        try {

            const getFilterQuery = this.rules.formRulesQuery(inputRules);
            // console.log('FILTER_QUERY:', getFilterQuery);

            if (!getFilterQuery) {
                console.log('NO_FILTERS_APPLIED:');

                return;
            }

            // db connect and query the table for filter records
            const filterData = await this.dbConnect.executeQuery(getFilterQuery);
            console.log('FILTER_DATA_LENGTH:', filterData.length);

            if (filterData.length > 0) {
                const addLabelActions = [];
                const removeLabelActions = [];
                inputRules.actions.forEach(action => {
                    switch (action.name) {
                        case 'move':
                            addLabelActions.push(action.value.toUpperCase());
                        case 'mark_as_read':
                            removeLabelActions.push('UNREAD');
                            break;
                        case 'mark_as_unread':
                            addLabelActions.push('UNREAD');
                            removeLabelActions.pop('UNREAD');
                            break;
                    }
                });

                const threadIds = _.map(filterData, 'thread_id');

                // apply the integration to process emails based on the rules actions
                await this.gmailConnect.processMailByLabel(
                    threadIds,
                    addLabelActions,
                    removeLabelActions
                );
            }
        } catch (err) {
            console.log('ERR_RUN_RULES:', err);
        }
    }
}

// apply the rules
const applyRules = new ApplyRules();

applyRules.runRules(inputRules);
