const states = {
	open: 'open', // open if service unreachable
	half: 'half-open', // doesn't implemented yet
	closed: 'closed' // closed if service fine
}

function ServiceBreaker({ stores, timeoutDuration, maxFailures }) {
	this.timeoutDuration = timeoutDuration || 100000 // Duration for open state, in ms (default 100000ms = 100s)
	this.maxFailures = maxFailures || 10 // max fail threshold for each service
	this.stores

	this.initStores(stores)
}

ServiceBreaker.prototype.initStores = function (stores) {
	this.stores = stores
}

ServiceBreaker.prototype.invoke = function ({ execute, fallback }, name, callback) {
	const currentService = this.stores.services[name]

	callback = callback && typeof callback === 'function' ? callback : function (err) {}

	// check if service is in the stores
	if (!this.stores.services[name]) {
		return callback(`Service "${name}" not found`)
	}

	// retry if already reach maximum failures threshold
	if ((currentService.retry === this.maxFailures ||
		currentService.retry > this.maxFailures) &&
		currentService.state === states['open']
	) {
		this.resetService(name)
		
		try {
			return execute.apply(null, [name])
		} catch (err) {
			return callback(err)
		}
	}

	// fallback when circuit breaker already open
	if (currentService.state === states['open']) {
		this.incrementServiceRetry(name)

		return fallback.apply(null, [name])
	}

	// try to execute function
	try {
		return execute.apply(null, [name])
	} catch (err) {
		this.incrementServiceRetry(name)

		return callback(err)
	}
}

ServiceBreaker.prototype.incrementServiceRetry = function (name) {
	this.stores.services[name].retry += 1
}

ServiceBreaker.prototype.resetService = function (name) {
	const self = this

	setTimeout(function () {
		self.stores.services[name].state = 'closed'
		self.stores.services[name].retry = 0
	}, self.timeoutDuration)
}

module.exports = ServiceBreaker