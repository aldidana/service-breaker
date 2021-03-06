# service-breaker

> Circuit breaker for calling another services

## Install

```
$ npm install service-breaker
```

## Usage

```js
const ServiceBreaker = require('service-breaker')
const config = {
	services: ['transaction', 'auth']
}

const serviceBreaker = new ServiceBreaker({
	config,
	timeoutDuration: 50000, // default 100000
	maxFailures: 5 // default 10
})

serviceBreaker.invoke({
	execute: request,
	fallback: fallback
}, 'transaction')

serviceBreaker.invoke({
	execute: request,
	fallback: fallback
}, 'auth')

serviceBreaker.invoke({
	execute: request,
	fallback: fallback
}, 'another', function (error) {
	console.log(error)
})

function request(params) {
	console.log(`${params} is ok`)
}

function fallback(params) {
	console.log(`Cannot reach ${params} service`)
}
```


## API

### `new ServiceBreaker`

ServiceBreaker([config, timeoutDuration, maxFailures])

### `invoke`

serviceBreaker.invoke([execute, fallback], serviceName, callback)

callback is optional, callback parameter is an error.

## License
MIT @Aldi Priya Perdana