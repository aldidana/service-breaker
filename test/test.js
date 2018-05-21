const assert = require('assert')

const ServiceBreaker = require('../index')
const config = {
	services: ['transaction']
}
const serviceBreaker = new ServiceBreaker({
	config,
	timeoutDuration: 300, // default 100000
	maxFailures: 3 // default 10
})

describe('Fail request to service', () => {
	it('Should fail. Retry equal to 1 and state is closed', done => {
		serviceBreaker.invoke({
			execute: simulateFailRequest,
			fallback: simulateFallback
		}, 'transaction', errorCallback)

		assert.equal(serviceBreaker.stores.services['transaction'].state, 'closed')
		assert.equal(serviceBreaker.stores.services['transaction'].retry, 1)

		done()
	})

	it('Should fail second time. Retry equal to 2 and state is closed', done => {
		serviceBreaker.invoke({
			execute: simulateFailRequest,
			fallback: simulateFallback
		}, 'transaction', errorCallback)

		assert.equal(serviceBreaker.stores.services['transaction'].state, 'closed')
		assert.equal(serviceBreaker.stores.services['transaction'].retry, 2)

		done()
	})

	it('Should fail third time. Retry equal to 3 and state is closed', done => {
		serviceBreaker.invoke({
			execute: simulateFailRequest,
			fallback: simulateFallback
		}, 'transaction', errorCallback)


		assert.equal(serviceBreaker.stores.services['transaction'].state, 'closed')
		assert.equal(serviceBreaker.stores.services['transaction'].retry, 3)

		done()
	})

	it('Should fail fourth time. Retry reset to 0 and state is open', done => {
		serviceBreaker.invoke({
			execute: simulateFailRequest,
			fallback: simulateFallback
		}, 'transaction', errorCallback)

		assert.equal(serviceBreaker.stores.services['transaction'].state, 'open')
		assert.equal(serviceBreaker.stores.services['transaction'].retry, 0)

		done()
	})

	it('Should fail fifth time. Retry and state should be the same as fourth', done => {
		serviceBreaker.invoke({
			execute: simulateFailRequest,
			fallback: simulateFallback
		}, 'transaction', errorCallback)

		assert.equal(serviceBreaker.stores.services['transaction'].state, 'open')
		assert.equal(serviceBreaker.stores.services['transaction'].retry, 0)

		done()
	})
})

describe('Wait circuit breaker to half-open', () => {
	it('Retry equal to 0 and state is half-open', done => {
		setTimeout(() => {
			assert.equal(serviceBreaker.stores.services['transaction'].state, 'half-open')
			assert.equal(serviceBreaker.stores.services['transaction'].retry, 0)

			done()
		}, 350)
	})
})

describe('If request success when state in half-open then close circuit breaker', () => {
	it('Should success. Retry equal to 0 and state is closed', done => {
		serviceBreaker.invoke({
			execute: simulateSuccessRequest,
			fallback: simulateFallback
		}, 'transaction', errorCallback)

		assert.equal(serviceBreaker.stores.services['transaction'].state, 'closed')
		assert.equal(serviceBreaker.stores.services['transaction'].retry, 0)

		done()
	})

	it('Should success second time. Retry equal to 1 and state is open', done => {
		serviceBreaker.invoke({
			execute: simulateSuccessRequest,
			fallback: simulateFallback
		}, 'transaction', errorCallback)

		assert.equal(serviceBreaker.stores.services['transaction'].state, 'closed')
		assert.equal(serviceBreaker.stores.services['transaction'].retry, 0)
		
		done()
	})
})

const simulateFailRequest = () => {
	throw 'Error service'
}

const simulateFallback = (name) => {
	return `Cannot reach ${name} service`
}

const simulateSuccessRequest = () => {
	return 'Success'
}

const errorCallback = (err) => {
	return `Error ${err}`
}