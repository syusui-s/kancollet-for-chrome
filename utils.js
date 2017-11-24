function fetchRefsPromise() {
	/* use cache if exists recently fetched refs */
	return new Promise((resolve, error) => {
		chrome.storage.local.get('last-refs', (storage) => {
			const last_refs = storage['last-refs'];
			if (last_refs) {
				const cache_available = ( Date.now() < (last_refs['date'] + 10*60*1000) );
				Object.assign(last_refs, { cache: cache_available, fetch: false });
				resolve(last_refs);
			} else {
				resolve({ cache: false });
			}
		});
	}).then((result) => {
		if (result.cache) { return result; }

		return new Promise((resolve, error) => {
			/* fetch refs from github */
			const refs_url = 'https://api.github.com/repos/syusui-s/kancollet/git/refs';
			const xhr = new XMLHttpRequest();
			xhr.responseType = 'json';
			xhr.addEventListener('load', (e) => {
				if (xhr.status === 200 && xhr.response) {
					Object.assign(result, { fetch: true, refs: xhr.response });
					resolve(result);
				} else {
					let reason;
					const info = {};
					if (xhr.status === 403 &&
						+xhr.getResponseHeader('X-RateLimit-Remaining') == 0
					) {
						reason = 'API_RATE_LIMIT';
						info.rateLimitReset = new Date(+xhr.getResponseHeader('X-RateLimit-Reset') * 1000);
					} else {
						reason = 'UNKNOWN';
					}
					Object.assign(result, { fetch: false, reason: reason, info: info });
					resolve(result);
				}
			});
			xhr.addEventListener('error', (e) => {
				console.log(e);
			});
			xhr.open('GET', refs_url, true);
			xhr.send();
		}).then((obj) => {
			/* generate refs */
			const refs = obj.refs.map((e) => {
				const match = e['ref'].match(/^refs\/(\w+)\/([\w-.]+)$/);
				let type = 'unknown';
				switch (match[1]) {
					case 'heads': type = 'repository'; break;
					case 'tags': type = 'tag'; break;
					default: break;
				}
				return { type: type, name: match[2] };
			});

			if (refs.length > 0) {
				chrome.storage.local.set({
					'last-refs': { refs: refs, date: Date.now() }
				});
				return refs;
			} else {
				return [];
			}
		});
	});
}

function filterUnneededRefs(refs) {
	const unneeded = ['gh-pages'];
	const unsupported = ['ver0.10', 'ver0.11'];

	return refs.filter((ref) => {
		const name = ref['name'];
		return ! (unneeded.includes(name) || unsupported.includes(name));
	});
}
