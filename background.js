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

	/* autoload configuration */
	let rule = {
		conditions: [
			new chrome.declarativeContent.PageStateMatcher({
				pageUrl: { hostEquals: 'www.dmm.com', pathPrefix: '/netgame/social/-/gadgets/=/app_id=854854/' }
			})
		],
		actions: [ new chrome.declarativeContent.ShowPageAction() ]
	};
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		chrome.declarativeContent.onPageChanged.addRules([rule]);
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
		
		sendResponse({ success: true, autoload: autoload, script_src: script_src });
	});

}

function onMessageHandler(message, sender, sendResponse) {
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
}

/* main */
chrome.runtime.onInstalled.addListener((details) => {
	if (['installl', 'update'].includes(details.reason)) { initializeSettings(); }
});
chrome.runtime.onMessage.addListener(onMessageHandler); 
chrome.pageAction.onClicked.addListener(executeKancollet);
