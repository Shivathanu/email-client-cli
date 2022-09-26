
import _ from 'lodash';
import moment from 'moment';

export const escapeString = (str) => {
    try {
        if (!str || str.length === 0) {
            return null;
        }

        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            char = char.normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, '')
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\" + char;
            }

            return char;
        });
    } catch {
        return str;
    }
}

export const findObjectByKey = (array, matchKey, matchObject) => {
    if (!array && !_.isArray(array)) {
        return array;
    }

    const matchedObject = array.find(object => object[`${matchKey}`] === matchObject);

    return matchedObject;
}

export const findValue = (array, matchKey, matchObject) => {
    let matchedObject = findObjectByKey(array, matchKey, matchObject);

    if (!_.has(matchedObject, 'value')) {
        return null;
    }

    return escapeString(matchedObject.value);
}

export const findBase64Content = (array, matchKey, matchObject) => {
    let encodedText = findObjectByKey(array, matchKey, matchObject);

    if (!_.has(encodedText, 'body.data')) {
        return encodedText;
    }

    const decodedText = Buffer.from(encodedText.body.data, 'base64').toString('ascii');

    return escapeString(decodedText);
}

export const findDateValue = (array, matchKey, matchObject) => {
    const dateValue = findValue(array, matchKey, matchObject);

    if (!dateValue) {
        return null;
    }

    const parsedDate = moment(new Date(dateValue)).format('YYYY-MM-DD HH:mm:ss');

    return parsedDate === 'Invalid date' ? null  : parsedDate;
}

export const getParsedMessage = message => {
    try {
        if (!_.has(message, 'threadId')) {
            return null;
        }

        const { threadId, labelIds, payload, sizeEstimate, historyId } = message;

        return [
            threadId || '',
            labelIds.join(',') || '',
            findValue(payload.headers, 'name', 'Delivered-To') || '',
            findValue(payload.headers, 'name', 'From') || '',
            findValue(payload.headers, 'name', 'To') || '',
            findValue(payload.headers, 'name', 'Subject') || '',
            findBase64Content(payload.parts, 'mimeType', 'text/plain') || '',
            findValue(payload.headers, 'name', 'Message-ID') || '',
            findDateValue(payload.headers, 'name', 'Date') || '1900-01-01',
            sizeEstimate || '',
            historyId || ''
        ]
    } catch {
        return null;
    }
}

export const getParsedInbox = messages => {
    try {
        const messagesList = _.map(messages, data => [data.id, data.threadId]);

        return messagesList;
    } catch {
        return null;
    }
}
