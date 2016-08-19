function initializeForms() {
	document.forms['settings'].addEventListener('submit', onSubmit);

	StorageAccess.get(['autoload', 'ref'], (storage) => {
		/* autoload */
		const autoload_form = document.forms['settings']['autoload'];
		autoload_form.value =
			('autoload' in storage) ? storage['autoload'].toString() : 'true';

		/* ref */
		const ref_form = document.forms['settings']['ref'];
		/* create options */
		fetchRefsPromise().then((refs) => {
			const found = refs.find((ref) => ref['name'] === storage['ref']) || 'master';
			const refs_cleaned = filterUnneededRefs(refs);
			const status_elem = document.querySelector('span#generating-refs');

			/* if there is no refs (when error) */
			if (refs.length === 0) {
				status_elem.textContent = '生成に失敗しました。インターネットに接続していますか？';
				return;
			}

			refs_cleaned.forEach((ref) => {
				const option = document.createElement('option');
				option.value = ref['name'];
				option.textContent = ref['name'];
				if (ref == found) { option.selected = true; }
				ref_form.appendChild(option);
			});
			ref_form.disabled = false;
			document.querySelector('option[value="disabled"]').remove();
			status_elem.remove();
		});
	});
}

function onSubmit(event) {
	event.preventDefault();
	const form = event.target;

	const autoload_value = document.forms['settings']['autoload'].value === 'true';
	const ref_value = document.forms['settings']['ref'].value;

	StorageAccess.update({
		autoload: autoload_value,
		ref: ref_value
	}, (success) => {
		alert('設定を保存しました。');
	}, (error) => {
		alert(error['message']);
	});
}

window.addEventListener('DOMContentLoaded', function() {
	initializeForms();
});
