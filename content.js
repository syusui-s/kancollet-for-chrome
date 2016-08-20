'use strict';

{
	function insertCode(object) {
		const { src, code, id } = object;
		if (! (src || code) ) { return false; }

		const script = document.createElement('script');
		if (id) { script.id = id; }
		script.setAttribute('language', 'javascript');
		script.setAttribute('charset', 'UTF-8');

		if (src)  { script.setAttribute('src', src); }
		if (code) { script.textContent = code; }

		document.head.appendChild(script);

		return true;
	}

	function executeKancollet(manual_launch) {
		chrome.runtime.sendMessage({ 'type': "getExecInfo" }, (execInfo) => {
			const { success, autoload, script_src } = execInfo || {};

			/* if not autoload and not manual_launch, or already exists */
			if (! ( success && (autoload || manual_launch) ) ) {
				return;
			}
			
			const script = document.getElementById('kancollet_script');
			if (script) {
				location.href('javascript:Kancollet.create();');
			} else {
				insertCode({ src: script_src, id: 'kancollet_script' });
			}
		});
	}

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === 'executeKancollet') { executeKancollet(true); }
	});

	executeKancollet(false);
}
