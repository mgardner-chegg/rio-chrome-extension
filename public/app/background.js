(function() {
    const tabStorage = {};  
    const networkFilters = {
        urls: [
            "*://analytics.chegg.com/*",
            "*://fn.chegg.com/*"
        ]
    };
    const extraInfoSpec = [ 'requestBody' ]

    function isNormalInteger(str) {
        var n = Math.floor(Number(str));
        return n !== Infinity && String(n) === str && n >= 0;
    }

    chrome.webRequest.onBeforeRequest.addListener((details) => {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId)) {
            return;
        }
        
        body = JSON.parse(decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes))));
        
        for (const key in body) {
            if (isNormalInteger(key)) {
                tabStorage[tabId].requests.push(body[key]);
            } else {
                tabStorage[tabId].requests.push(body);
                break;
            }

        }

    }, networkFilters, extraInfoSpec);

    chrome.tabs.onActivated.addListener((tab) => {
        const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
        if (!tabStorage.hasOwnProperty(tabId)) {
            tabStorage[tabId] = {
                id: tabId,
                requests: []
            };
        }
    });

    chrome.tabs.onRemoved.addListener((tab) => {
        const tabId = tab.tabId;
        if (!tabStorage.hasOwnProperty(tabId)) {
            return;
        }
        tabStorage[tabId] = null;
    });

    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        switch (msg.type) {
            case 'UIInit':
                if (tabStorage[msg.tabId]) {
                    if (tabStorage[msg.tabId].requests) {
                        response(tabStorage[msg.tabId].requests);
                    } else {
                        response({});
                    }
                } else {
                    response('unknown tab');
                }
                break;
            default:
                response('unknown request');
                break;
        }
    });

}());