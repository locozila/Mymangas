chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'unionleitor.top'},
                })],
                    actions: [new chrome.declarativeContent.ShowPageAction()]
            },
            {
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'unionmangas.top'},
                })],
                    actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
    chrome.storage.local.set({'list': ""});
});