curl -v -X POST https://api.line.me/v2/bot/richmenu \
    -H 'Authorization: Bearer HOqcUq5EL4moJ6XL5BDfnrlPKtVzwPBtvA3q8ULZoetFya2BT3Sqzl00W4xIz7naewbcBlvGqyhghPw9SxVLWw4Cd7/bzRWS2pvuU9DrXHi6FTgseJrpcIm7nvg+0aPPTkrGfkUTHxaN39mVeDNZ4wdB04t89/1O/w1cDnyilFU=' \
    -H 'Content-Type: application/json' \
    -d \
    '{
  "size":{
      "width":2500,
      "height":843
  },
  "selected": true,
  "name": "ISERichMenu",
  "chatBarText": "Menu",
  "areas": [
      {
          "bounds": {
              "x": 0,
              "y": 0,
              "width": 833,
              "height": 843
          },
          "action": {
              "type": "uri",
              "label": "Homework",
              "uri": "http://bit.ly/3b1wOSk"
          }
      },
      {
          "bounds": {
              "x": 834,
              "y": 0,
              "width": 833,
              "height": 843
          },
          "action": {
                "type":"postback",
                "label":"Event",
                "data":"Service unavailable."
          }
      },
      {
          "bounds": {
              "x": 1668,
              "y": 0,
              "width": 833,
              "height": 843
          },
          "action": {
                "type":"postback",
                "label":"Event",
                "data":"Service unavailable."
          }
      }
  ]
}'
