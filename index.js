const express = require("express");
const line = require("@line/bot-sdk");
const middleware = require("@line/bot-sdk").middleware;
const JSONParseError = require("@line/bot-sdk").JSONParseError;
const SignatureValidationFailed = require("@line/bot-sdk")
    .SignatureValidationFailed;

const app = express();

const config = {
    channelAccessToken:
        "HOqcUq5EL4moJ6XL5BDfnrlPKtVzwPBtvA3q8ULZoetFya2BT3Sqzl00W4xIz7naewbcBlvGqyhghPw9SxVLWw4Cd7/bzRWS2pvuU9DrXHi6FTgseJrpcIm7nvg+0aPPTkrGfkUTHxaN39mVeDNZ4wdB04t89/1O/w1cDnyilFU=",
    channelSecret: "66eb8d541baf9dabbc16953c104988a7"
};

app.use(middleware(config));

app.post("/webhook", (req, res) => {
    res.json(req.body.events[0]); // req.body will be webhook event object
    const client = new line.Client(config);

    client
        .getProfile(req.body.events[0].source.userId)
        .then(profile => {
            console.log(profile.displayName);
            console.log(profile.userId);
            console.log(profile.statusMessage);
        })
        .catch(err => {
            // error handling
        });

    const message = {
        type: "text",
        text: "Message: " + req.body.events[0].message.text
    };

    client
        .replyMessage(req.body.events[0].replyToken, message)
        .then(() => {})
        .catch(err => {
            // error handling
        });
});

app.use((err, req, res, next) => {
    if (err instanceof SignatureValidationFailed) {
        res.status(401).send(err.signature);
        return;
    } else if (err instanceof JSONParseError) {
        res.status(400).send(err.raw);
        return;
    }
    next(err); // will throw default 500
});

app.listen(process.env.PORT);
