import GmailRequest from './connector/gmail-connect.js';
import DBConnect from './connector/db-connect.js';

(async () => {
    try {
        const gmailRequest = new GmailRequest();

        // get my inbox messages from gmail
        const mailParsedMessage = await gmailRequest.loadInbox(
            `older_than:${process.env.LOAD_INBOX_DAYS}d`
        );

        const dbConnect = new DBConnect();

        await dbConnect.refreshInbox();
        await dbConnect.createMessages(mailParsedMessage.inbox);
        await dbConnect.createMessageDetails(mailParsedMessage.details);

        console.log('INBOX_LOAD_SUCCESS');
    } catch (error) {
        console.log('TRY_AGAIN_SOMETIME:', error);
    }
})();
