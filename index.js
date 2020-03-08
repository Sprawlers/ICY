const express = require("express");
const middleware = require("@line/bot-sdk").middleware;
const JSONParseError = require("@line/bot-sdk").JSONParseError;
const SignatureValidationFailed = require("@line/bot-sdk")
    .SignatureValidationFailed;

const app = express();

const config = {
    channelAccessToken:
        "hkhfGu6/eGHuFrth06Ut4BpqYMUelqNHzTXEj51D2eykgilO8/MxwIyBfeMSd7QdtMgaN9bL+snBl4V0abEcF2tQNukW9wpI8MBFW7peqvRhV5zqaK7S+/WCtl6x0JbK84T5QIULb/D4gEm2O5mZuwdB04t89/1O/w1cDnyilFU=",
    channelSecret: "98e5f2a6b1aecfb43b6116ee6046ea3d"
};

app.use(middleware(config));
app.use(express.json());
app.use(
    express.urlencoded({
        extended: false
    })
);

app.post("/webhook", (req, res) => {
    res.json(req.body.events); // req.body will be webhook event object
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
