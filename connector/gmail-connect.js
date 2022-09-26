import axios from 'axios';
import _ from 'lodash';
import qs from 'qs';
import { getParsedInbox, getParsedMessage } from  '../common/utils.js';

export default class GmailRequest {
    getAccessToken = async () => {
        const data = qs.stringify({
            'client_id': process.env.EMAIL_CLIENT_ID,
            'client_secret': process.env.EMAIL_CLIENT_SECRET,
            'refresh_token': process.env.EMAIL_CLIENT_REFRESH_TOKEN,
            'grant_type': process.env.EMAIL_CLIENT_GRANT_TYPE
        });
        const config = {
            method: 'post',
            url: process.env.GMAIL_API_TOKEN_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const token = await axios(config);

        return token.data;
    };

    getMessages = async searchString => {
        try {
            let queryString = searchString ? `q=${searchString}` : '';

            queryString = queryString + `&maxResults=${process.env.MESSAGE_LENGTH}&includeSpamTrash=true`;
            const tokenResponse = await this.getAccessToken();

            const config = {
                method: 'get',
                url: `${process.env.GMAIL_API_GET_MESSAGES}/${process.env.USER_ID}/messages?${queryString}`,
                headers: {
                    'Authorization': `Bearer ${tokenResponse.access_token}`
                }
            };

            const mailMessages = await axios(config);

            return mailMessages;
        } catch (error) {
            console.log('ERR_GET_MESSAGES:', error);

            return [];
        }
    };

    getMessage = async threadId => {
        try {
            const tokenResponse = await this.getAccessToken();
            const config = {
                method: 'get',
                url: `${process.env.GMAIL_API_GET_MESSAGES}/${process.env.USER_ID}/messages/${threadId}`,
                headers: {
                    'Authorization': `Bearer ${tokenResponse.access_token}`
                }
            };

            const mailMessage = await axios(config);

            return {
                threadId: mailMessage.data.threadId,
                labelIds: mailMessage.data.labelIds,
                payload: mailMessage.data.payload,
                sizeEstimate: mailMessage.data.sizeEstimate,
                historyId: mailMessage.data.historyId
            };
        } catch (error) {
            return {};
        }
    }

    loadInbox = async filter => {
        try {
            const result = await this.getMessages(filter);

            const messageDetails = [];

            await Promise.all(result.data.messages.map(async message => {
                const emailMessage = await this.getMessage(message.threadId);

                const parsedMessage = getParsedMessage(emailMessage);

                messageDetails.push(parsedMessage);
            }));

            return {
                inbox: getParsedInbox(result.data.messages),
                details: _.compact(messageDetails)
            };
        } catch (error) {
            console.log('ERR_LOAD_INBOX:', error);

            return [];
        }
    };

    processMailByLabel = async (threadIds, addLabelIds, removeLabelIds) => {
        try {
            const tokenResponse = await this.getAccessToken();
            var data = JSON.stringify({
                "ids": [threadIds],
                "addLabelIds": addLabelIds,
                "removeLabelIds": removeLabelIds
            });
            const config = {
                method: 'post',
                url: `${process.env.GMAIL_API_GET_MESSAGES}/${process.env.USER_ID}/messages/batchModify`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenResponse.access_token}`
                },
                data
            };

            const mailMessage = await axios(config);

            console.log('COMPLETED_PROCESS_MESSAGES:', mailMessage.status);

            return mailMessage.status;
        } catch (error) {
            console.log('ERR_PROCESS_MESSAGES:', error.error);

            return error.code;
        }
    }
};
