function fetchRefsPromise() {
	/* use cache if exists recently fetched refs */
	return new Promise((resolve, error) => {
		chrome.storage.local.get('last-refs', (storage) => {
			const last_refs = storage['last-refs'];
			if (last_refs) {
				const expired = (Date.now() > (last_refs['date'] + 10*60*1000));
				Object.assign(last_refs, { 'expired': expired });
				resolve(last_refs);
			} else {
				resolve({ 'expired': false, refs: [] });
			}
		});
	}).then((last_refs) => {
		if (! last_refs['expired']) { return last_refs['refs']; }

		return new Promise((resolve, error) => {
			const refs_url = 'https://api.github.com/repos/syusui-s/kancollet/git/refs';
			const xhr = new XMLHttpRequest();
			xhr.open('GET', refs_url, true);
			xhr.onload = (e) => {
				if (xhr.status === 200 && xhr.responseText.length > 0) {
					let obj;
					try { obj = JSON.parse(xhr.responseText) || []; }
					catch (e) { return last_refs['refs']; }
					resolve(obj);
				} else { return []; }
			};
			xhr.send();
		}).then((obj) => {
			const refs = obj.map((e) => {
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
