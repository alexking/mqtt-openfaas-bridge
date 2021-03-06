## MQTT OpenFaas Bridge 

Run async OpenFaas functions and receive results back via MQTT.

To run a function, publish a message
on the topic `openfaas/invoke/function-name` with a JSON payload.

```js
{
    "input": "input for openfaas function",
    
    // Callback parameters will be passed through to the response
    "callbackParams": {
        "url-encoded": "additional-info"
    }
} 
```

You can then listen for results on the `openfaas/results/function-name` topic.

```js
{
    "output": "output from the function",
    "params": {
        "params": "are passed through"
    }
}
```

You can configure the bridge by setting environmental variables manually or in a `.env` file. They're currently documented in the [.env.example](.env.example) file.
