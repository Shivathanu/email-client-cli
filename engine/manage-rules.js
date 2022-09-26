import configRules from './config-rules.json' assert { type: "json" };
import _ from 'lodash';
import moment from 'moment';

export default class RulesManager {
    formRulesQuery = (input) => {
        // get the rule to run from the configured rules list
        const rulesDetail = configRules.find((rule) => rule.name === input.name);

        const queryParams = [];

        input.rules.forEach((rule) => {
            // change the input field name to the actual field name
            // from is a reserved word in mysql so changing to the actual field name
            if (_.includes(['from', 'to', 'subject'], rule.field)) {
                rule.field = `message_${rule.field}`;
            }

            if (!rule.enabled) {
                return;
            }

            // get the rule for string fields
            switch (rule.predicate) {
                case 'contains':
                    queryParams.push(`${rule.field} LIKE '%${rule.value}%'`);
                    break;
                case 'does_not_contain':
                    queryParams.push(`${rule.field} NOT LIKE '%${rule.value}%'`);
                    break;
                case 'equals':
                    queryParams.push(`${rule.field} = '${rule.value}'`);
                    break;
                case 'not_equal':
                    queryParams.push(`${rule.field} <> '${rule.value}'`);
                    break;
                case 'less_than_days':
                    queryParams.push(`${rule.field} < '${moment().subtract(rule.value, 'days').format('YYYY-MM-DD hh:mm:ss.SSS')}'`);
                    break;
                case 'less_than_months':
                    queryParams.push(`${rule.field} < '${moment().subtract(rule.value, 'months').startOf('month').format('YYYY-MM-DD hh:mm:ss.SSS')}'`);
                    break;
                case 'greater_than_days':
                    queryParams.push(`${rule.field} > '${moment().add(rule.value, 'days').format('YYYY-MM-DD hh:mm:ss.SSS')}'`);
                    break;
                case 'greater_than_months':
                    queryParams.push(`${rule.field} > '${moment().add(rule.value, 'months').startOf('month').format('YYYY-MM-DD hh:mm:ss.SSS')}'`);
                    break;
                default:
                    break;
            }
        });

        if (queryParams.length > 0) {
            if (input.case.toLowerCase() === 'any') {
                return `SELECT * FROM ${rulesDetail.filterTable} WHERE ${queryParams.join(' OR ')}`;
            }

            if (input.case.toLowerCase() === 'all') {
                return `SELECT * FROM ${rulesDetail.filterTable} WHERE ${queryParams.join(' AND ')}`;
            }
        }

        return '';
    }
}
