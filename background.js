'use strict';

function executeKancollet(tab) {
	chrome.tabs.sendMessage(tab.id, { type: 'executeKancollet' });
}

/* called when first execution or update */
function initializeSettings() {
	let defaultSettings = { 'autoload': true, 'ref': 'master' };
	chrome.storage.sync.get(['autoload', 'ref'], (storage) => {
		chrome.storage.sync.set( Object.assign(defaultSettings, storage) );
	});
}

function handleGetExecInfo(sendResponse) {
	const master_url = 'http://syusui-s.github.io/kancollet/kancollet-master/kancollet/kancollet.js';
	const cdn_url = 'https://cdn.rawgit.com/syusui-s/kancollet/:ref:/kancollet/kancollet.js';

	chrome.storage.sync.get(['autoload', 'ref'], (storage) => {
		const { autoload, ref } = storage;

		let script_src = null;
		if (ref === 'master') { script_src = master_url; }
		else { script_src = cdn_url.replace(':ref:', ref || 'master'); }
		
		console.log("execinfo");
		sendResponse({ success: true, autoload: autoload, script_src: script_src });
	});

}

/* main */
chrome.runtime.onInstalled.addListener((details) => {
	if (['installl', 'update'].includes(details.reason)) { initializeSettings(); }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!sender.tab) {
		sendResponse({ success: false });
		return;
	}

	switch (message.type) {
		case 'getExecInfo':
			handleGetExecInfo(sendResponse);
			break;
		default:
			sendResponse({ success: false });
			break;
	}

	return true;
});

chrome.browserAction.onClicked.addListener(executeKancollet);
