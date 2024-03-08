///////// EVENTEMITTER ///////////

class EventEmitter {
	constructor() {
		this._events = {};
		if (this.constructor === EventEmitter) {
			throw new Error('Cannot instanciate abstract class');
		}
	}

	on(evt, listener) {
		(this._events[evt] || (this._events[evt] = [])).push(listener);
		return this;
	}

	once(evt, listener) {
		const fct = (a) => {
			let arr = this._events[evt].filter(it => it != fct);
			return ((arr.length > 0) ? (this._events[evt] = arr) : (delete this._events[evt])) && listener(a);
		}
		return this.on(evt, fct);
	}

	emit(evt, ...arg) {
		(this._events[evt] || []).slice().forEach(lsn => lsn((arg.length == 1 ? arg[0] : arg)));
		return this;
	}
	
	connect(evt, target, evtTarget) {
		return this.on(evt, (a) => { target.emit(evtTarget, a); });
	}
	
	countEvent() {
		return Object.keys(this._events).length;
	}

	countListener(evt) {
		return (this._events[evt] || []).length ;
	}
	
	removeAllListeners(evt) {
		delete this._events[evt];
		return this;
	}

	resetEvent() {
		this._events = {};
		return this;
	}

	static attachEvent(evt, src, target) {
		if (!(src instanceof EventEmitter) || !(target instanceof EventEmitter)) {
			throw "attachEventError : src and target must be inherited from EventEmitter";
		}
		return src.on(evt, (a) => { target.emit(evt, a); });
	}
	
	static detachEvent(evt, target) {
		if (!(target instanceof EventEmitter)) {
			throw "detachEventError : target must be inherited from EventEmitter";
		}
		return target.removeAllListeners(evt);
	}
	
	static bind(evtSrc, src, evtTarget, target) {
		if (!(src instanceof EventEmitter) || !(target instanceof EventEmitter)) {
			throw "bindError : src and target must be inherited from EventEmitter";
		}
		return src.on(evtSrc, (a) => { target.emit(evtTarget, a); });		
	}
}