'use strict';

{
	function insertCode(script_src) {
		const new_script = document.createElement('script');
		new_script.id = 'kancollet_script';
		new_script.setAttribute('language', 'javascript');
		new_script.setAttribute('src', script_src);
		new_script.setAttribute('charset', 'UTF-8');
		document.head.appendChild(new_script);
	}

	function executeKancollet(manual_launch) {
		chrome.runtime.sendMessage({ 'type': "getExecInfo" }, (execInfo) => {
			const { success, autoload, script_src } = execInfo || {};

			/* if not autoload and not manual_launch, or already exists */
			if (! success
				|| (!autoload && !is_manual_launch)
				|| document.querySelector('div#kancollet')
			) { return; }
			
			const script = document.getElementById('kancollet_script');
			if (script) {
				Kancollet.create();
			} else {
				insertCode(script_src);
			}
		});
	}

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === 'executeKancollet') { executeKancollet(true); }
	});

	executeKancollet(false);
}
