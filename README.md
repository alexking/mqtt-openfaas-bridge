## MQTT OpenFaas Bridge 

Run async OpenFaas functions and receive results back via MQTT.

To run a function, publish a message
on the topic `openfaas/invoke/function-name` with a JSON payload.

```json
{
    "input": "input for openfaas function",
    
    // Callback parameters will be passed through to the response
    "callbackParams": {
        "url-encoded": "additional-info"
    }
} 
```

You can then listen for results on the `openfaas/results/function-name` topic.

```json
    "output": "output from the function",
    "params": {
        "params": "are passed through"
    }
```

