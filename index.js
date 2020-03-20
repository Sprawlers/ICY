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

app.post("/webhook", async (req, res) => {
    res.json(req.body.events[0]); // req.body will be webhook event object
    const client = new line.Client(config);
    const message = {
        type: "text",
        text: null
    };
    const event = req.body.events[0];

    const profile = await client.getProfile(event.source.userId)
    console.log(`User: ${profile.displayName}`);

    switch (event.type) {
        case "postback":
            console.log(`Action: Pressed <${event.postback.data}> button`);
            switch (event.postback.data) {
                case "Homework":
                    message.text = "https://drive.google.com/file/d/1VOluchLTU2T8-MsvTtECEQLdjrbpO5wU/view";
                    break;
                default:
                    message.text = "Service unavailable";
            }

            await client.replyMessage(req.body.events[0].replyToken, message)
            break;
        case "message":
            console.log(`Action: Sent message "${event.message.text}"`);
            message.text =
                "Thank you for your feedback. We'll contact you back if necessary";

            await client.replyMessage(req.body.events[0].replyToken, message)
            break;
    }
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
