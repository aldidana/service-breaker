const ServiceBreaker = require('../index')
const stores = {
	services: {
		transaction: {
			retry: 0,
			state: 'closed'
		},
		auth: {
			retry: 0,
			state: 'open'
		}
	}
}

const serviceBreaker = new ServiceBreaker({
	stores,
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