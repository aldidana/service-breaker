const states = {
	open: 'open', // open if service unreachable
	half: 'half-open', // doesn't implemented yet
	closed: 'closed' // closed if service fine
}

function ServiceBreaker({ config, timeoutDuration, maxFailures }) {
	this.timeoutDuration = timeoutDuration || 100000 // Duration for open state, in ms (default 100000ms = 100s)
	this.maxFailures = maxFailures || 10 // max fail threshold for each service
	this.stores

	this.initStores(config)
}

ServiceBreaker.prototype.initStores = function (config) {
	const stores = {
		services: {}
	}

	config.services.forEach(name => {
		stores.services[name] = {
			retry: 0,
			state: 'closed'
		}
	})
	this.stores = stores
}

ServiceBreaker.prototype.invoke = function ({ execute, fallback }, name, callback) {
	const currentService = this.stores.services[name]

	callback = callback && typeof callback === 'function' ? callback : function (err) {}

	// check if service is in the stores
	if (!this.stores.services[name]) {
		return callback(`Service "${name}" not found`)
	}

	if (currentService.retry >= this.maxFailures && currentService.state !== states['open']) {
		this.openCircuitBreaker(name)
		this.startTimeout(name)
		return fallback.apply(null, [name])
	}

	if (currentService.state === states['open']) {
		return fallback.apply(null, [name])
	}

	if (currentService.state === states['closed']) {
		try {
			return execute.apply(null, [name])
		} catch (err) {
			this.incrementServiceRetry(name)
			return callback(err)
		}
	}

	if (currentService.state === states['half']) {
		try {
			execute.apply(null, [name])
			return this.resetService(name)
		} catch (err) {
			this.openCircuitBreaker(name)
			this.startTimeout(name)

			return callback(err)
		}
	}
}

ServiceBreaker.prototype.incrementServiceRetry = function (name) {
	this.stores.services[name].retry += 1
}

ServiceBreaker.prototype.resetService = function (name) {
	this.stores.services[name].state = 'closed'
	this.stores.services[name].retry = 0
}

ServiceBreaker.prototype.startTimeout = function (name) {
	const self = this

	setTimeout(function () {
		self.stores.services[name].state = 'half-open'
	}, self.timeoutDuration)
}

ServiceBreaker.prototype.openCircuitBreaker = function (name) {
	this.stores.services[name].state = 'open'
	this.stores.services[name].retry = 0
}

module.exports = ServiceBreaker