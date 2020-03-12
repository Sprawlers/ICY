curl -v -X POST https://api.line.me/v2/bot/richmenu \
-H 'Authorization: Bearer hkhfGu6/eGHuFrth06Ut4BpqYMUelqNHzTXEj51D2eykgilO8/MxwIyBfeMSd7QdtMgaN9bL+snBl4V0abEcF2tQNukW9wpI8MBFW7peqvRhV5zqaK7S+/WCtl6x0JbK84T5QIULb/D4gEm2O5mZuwdB04t89/1O/w1cDnyilFU=' \
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
              "uri": "https://developers.line.biz/en/news/"
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
              "type": "uri",
              "uri": "https://www.line-community.me/"
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
              "type": "uri",
              "uri": "https://www.google.com/"
          }
      }
  ]
}'

// richmenu-ca23cfac9b51a9a12b6fa27104496493