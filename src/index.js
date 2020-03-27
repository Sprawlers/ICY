const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const port = process.env.PORT || 4000

// Import the appropriate class
const { WebhookClient, Payload } = require('dialogflow-fulfillment')

app.use(morgan('dev'))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({
    success: true
  })
})

app.get('/test', (req, res) => {
  res.send('Hello Test')
  console.log('Hi There')
})

app.post('/webhook', (req, res) => {
  console.log('POST: /')
  console.log('Body: ', req.body)

  //Create an instance
  const agent = new WebhookClient({
    request: req,
    response: res
  })

  //Test get value of WebhookClient
  console.log('agentVersion: ' + agent.agentVersion)
  console.log('intent: ' + agent.intent)
  console.log('locale: ' + agent.locale)
  console.log('query: ', agent.query)
  console.log('session: ', agent.session)

  //Function Location
  function homework(agent) {
    agent.add('Please select a subject...')
    const payloadJSON = {
      type: 'flex',
      altText: 'this is a flex message',
      contents: {
        type: 'carousel',
        contents: [
          {
            type: 'bubble',
            direction: 'ltr',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'ComProg',
                  weight: 'bold',
                  size: 'xxl',
                  align: 'center',
                  gravity: 'center',
                  color: '#000000',
                  wrap: true
                }
              ],
              backgroundColor: '#FFFFFF',
              cornerRadius: '0px'
            },
            hero: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '📅 Deadline April 7',
                  size: 'lg',
                  align: 'center',
                  gravity: 'center',
                  contents: [
                    {
                      type: 'span',
                      text: '📅 Deadline: '
                    },
                    {
                      type: 'span',
                      text: 'April 7',
                      weight: 'regular'
                    }
                  ]
                }
              ]
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'separator'
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  action: {
                    type: 'uri',
                    uri: 'http://linecorp.com/',
                    label: 'View Solution'
                  },
                  gravity: 'center',
                  style: 'secondary'
                }
              ],
              backgroundColor: '#FFFFFF'
            },
            size: 'kilo',
            styles: {
              header: {
                backgroundColor: '#ffaaaa',
                separator: false
              },
              body: {
                backgroundColor: '#ffffff'
              },
              footer: {
                backgroundColor: '#aaaaff'
              }
            }
          },
          {
            type: 'bubble',
            direction: 'ltr',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'Calculus',
                  weight: 'bold',
                  size: 'xxl',
                  align: 'center',
                  gravity: 'center',
                  color: '#000000',
                  wrap: true
                }
              ],
              backgroundColor: '#FFFFFF',
              cornerRadius: '0px'
            },
            hero: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '📅 Deadline April 7',
                  size: 'lg',
                  align: 'center',
                  gravity: 'center',
                  contents: [
                    {
                      type: 'span',
                      text: '📅 Deadline: '
                    },
                    {
                      type: 'span',
                      text: 'April 7',
                      weight: 'regular'
                    }
                  ]
                }
              ]
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'separator'
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  action: {
                    type: 'uri',
                    uri: 'http://linecorp.com/',
                    label: 'View Solution'
                  },
                  gravity: 'center',
                  style: 'secondary'
                }
              ],
              backgroundColor: '#FFFFFF'
            },
            size: 'kilo',
            styles: {
              header: {
                backgroundColor: '#ffaaaa',
                separator: false
              },
              body: {
                backgroundColor: '#ffffff'
              },
              footer: {
                backgroundColor: '#aaaaff'
              }
            }
          }
        ]
      }
    }
    let payload = new Payload(`LINE`, payloadJSON, { sendAsMessage: true })
    agent.add(payload)
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map()
  intentMap.set('Homework', homework) // "Homework" is once Intent Name of Dialogflow Agent
  agent.handleRequest(intentMap)
})

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`)
})
