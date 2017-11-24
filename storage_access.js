'use strict';

var StorageAccess = {
	allKeys: ['autoload', 'ref'],
	validatePromises: {
		autoload(value) {
			return (typeof(value) === 'boolean')
				?  Promise.resolve()
				: Promise.reject({ message: 'Invalid "autoload" value.' });
		},
		ref(value) {
			return fetchRefsPromise().then((result) => {
				const { refs } = result;
				const found = filterUnneededRefs(refs).find( (ref) => (ref['name'] == value) );
				return found
					? Promise.resolve()
					: Promise.reject({ message: 'Invalid "ref" value.' });
			});
		}
	},
	validatePromise(key, value) {
		if (key in this.validatePromises) {
			return this.validatePromises[key](value);
		} else {
			return Promise.reject({ message: `Invalid key. No such key "${key}" in validations.` });
		}
	},
	update(object, handler, error_handler) {
		const validations = Object.keys(object).map( (key) => this.validatePromise(key, object[key]) );

		Promise.all(validations).then((value) => {
			/* if succeed */
			chrome.storage.sync.set(object, handler);
			
		}, (error) => {
			/* when error */
			error_handler(error);
		});
	},
	get(keys, handler) {
		if (typeof(keys) === 'string') { keys = [keys]; }
		chrome.storage.sync.get(keys, handler);
	}
};
