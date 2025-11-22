'use strict'

// Handle messages from popup/options pages
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'getPbData') {
        // Send pb data to requesting page
        sendResponse({
            pbData: {
                local: pb.local || {},
                settings: pb.settings || {},
                notifier: pb.notifier || { active: {} },
                browser: pb.browser,
                version: pb.version,
                userAgent: pb.userAgent,
                www: pb.www
            }
        })
        return true
    } else if (message.type === 'checkCookie') {
        // Manually check for cookie (useful after sign-in)
        console.log('checkCookie message received')
        
        // Debug: Check if we can access ANY cookies at all
        chrome.cookies.getAll({}, function(allCookies) {
            console.log('Total cookies accessible:', allCookies.length)
            var pbCookies = allCookies.filter(function(c) {
                return c.domain.indexOf('pushbullet') !== -1
            })
            console.log('Pushbullet-related cookies:', pbCookies)
        })
        
        // Debug: List all pushbullet cookies with different domain variations
        chrome.cookies.getAll({ domain: 'pushbullet.com' }, function(cookies) {
            console.log('All pushbullet.com cookies:', cookies)
        })
        chrome.cookies.getAll({ domain: '.pushbullet.com' }, function(cookies) {
            console.log('All .pushbullet.com cookies:', cookies)
        })
        chrome.cookies.getAll({ domain: 'www.pushbullet.com' }, function(cookies) {
            console.log('All www.pushbullet.com cookies:', cookies)
        })
        
        // Try to get the cookie with different URL variations
        chrome.cookies.get({ url: 'http://www.pushbullet.com', name: 'api_key' }, function(cookie) {
            console.log('HTTP www cookie:', cookie)
        })
        chrome.cookies.get({ url: 'https://pushbullet.com', name: 'api_key' }, function(cookie) {
            console.log('HTTPS no-www cookie:', cookie)
        })
        
        chrome.cookies.get({ 'url': 'https://www.pushbullet.com', 'name': 'api_key' }, function(cookie) {
            console.log('Cookie check result:', cookie)
            if (cookie && cookie.value && cookie.value !== 'undefined' && cookie.value !== 'null') {
                console.log('Manual cookie check found api_key:', cookie.value)
                
                // Only reload if this is a new API key
                var isNewKey = localStorage.apiKey !== cookie.value
                localStorage.apiKey = cookie.value
                
                delete localStorage.hasShownSignInNotification
                
                if (isNewKey && typeof main === 'function') {
                    console.log('New API key detected, calling main()')
                    main()
                }
                
                sendResponse({ success: true, apiKey: cookie.value })
            } else {
                console.log('No api_key cookie found')
                sendResponse({ success: false })
            }
        })
        return true
    } else if (message.type === 'dispatchEvent') {
        if (pb.dispatchEvent) {
            pb.dispatchEvent(message.eventName, message.details)
        }
    } else if (message.type === 'track') {
        if (pb.track) {
            pb.track(message.data)
        }
    } else if (message.type === 'saveSettings') {
        console.log('saveSettings message received with settings:', message.settings)
        
        // Update pb.settings with the new values
        if (message.settings) {
            Object.assign(pb.settings, message.settings)
            console.log('Updated pb.settings:', pb.settings)
        }
        
        if (pb.saveSettings) {
            pb.saveSettings()
            console.log('pb.saveSettings() called')
        }
        
        // Notify all pages of the update
        notifyPbUpdate()
    } else if (message.type === 'openTab') {
        if (pb.openTab) {
            pb.openTab(message.url)
        }
    } else if (message.type === 'apiKeyFound') {
        console.log('apiKeyFound message received from content script:', message.apiKey)
        
        // Only save if it's a new API key
        if (localStorage.apiKey !== message.apiKey) {
            console.log('New API key detected from content script, saving...')
            localStorage.apiKey = message.apiKey
            delete localStorage.hasShownSignInNotification
            
            if (typeof main === 'function') {
                console.log('Calling main() to reload with new API key')
                main()
            }
            
            notifyPbUpdate()
        }
    } else if (message.type === 'reloadAfterSignIn') {
        console.log('reloadAfterSignIn message received')
        if (typeof main === 'function') {
            console.log('Calling main() to reload after sign-in')
            main()
        }
    } else if (message.type === 'signOut') {
        if (pb.signOut) {
            pb.signOut()
        }
    } else if (message.type === 'popOutPanel') {
        if (pb.popOutPanel) {
            pb.popOutPanel()
        }
    } else if (message.type === 'setAwake') {
        if (pb.setAwake) {
            pb.setAwake(message.source, message.awake)
        }
    } else if (message.type === 'snooze') {
        if (pb.snooze) {
            pb.snooze()
        }
    } else if (message.type === 'unsnooze') {
        if (pb.unsnooze) {
            pb.unsnooze()
        }
    } else if (message.type === 'sendPush') {
        if (pb.sendPush) {
            pb.sendPush(message.push)
        }
    } else if (message.type === 'sendSms') {
        if (pb.sendSms) {
            pb.sendSms(message.data)
        }
    } else if (message.type === 'getThreads') {
        if (pb.getThreads) {
            pb.getThreads(message.deviceIden, function(response) {
                sendResponse(response)
            })
            return true
        }
    } else if (message.type === 'getThread') {
        if (pb.getThread) {
            pb.getThread(message.deviceIden, message.threadId, function(response) {
                sendResponse(response)
            })
            return true
        }
    } else if (message.type === 'getPhonebook') {
        if (pb.getPhonebook) {
            pb.getPhonebook(message.deviceIden, function(response) {
                sendResponse(response)
            })
            return true
        }
    } else if (message.type === 'setActiveChat') {
        if (pb.setActiveChat) {
            pb.setActiveChat(message.tabId, message.data)
        }
    } else if (message.type === 'clearActiveChat') {
        if (pb.clearActiveChat) {
            pb.clearActiveChat(message.tabId)
        }
    } else if (message.type === 'openChat') {
        if (pb.openChat) {
            pb.openChat(message.mode, message.other)
        }
    }
    return true
})

// Notify all extension pages when pb data changes
var notifyPbUpdate = function() {
    chrome.runtime.sendMessage({
        type: 'pbUpdate',
        data: {
            local: pb.local || {},
            settings: pb.settings || {},
            notifier: pb.notifier || { active: {} },
            browser: pb.browser,
            www: pb.www
        }
    }).catch(function() {
        // Ignore errors if no pages are listening
    })
}

// Hook into pb events to notify pages
if (pb.addEventListener) {
    pb.addEventListener('signed_in', notifyPbUpdate)
    pb.addEventListener('signed_out', notifyPbUpdate)
}

// Listen for cookie changes to detect sign-in
if (chrome.cookies && chrome.cookies.onChanged) {
    chrome.cookies.onChanged.addListener(function(changeInfo) {
        console.log('Cookie changed:', changeInfo.cookie.name, changeInfo.cookie.domain, 'removed:', changeInfo.removed)
        
        if (changeInfo.cookie.name === 'api_key' && 
            changeInfo.cookie.domain.indexOf('pushbullet.com') !== -1 &&
            !changeInfo.removed) {
            // API key cookie was set, reload the extension state
            console.log('API key cookie detected:', changeInfo.cookie.value)
            pb.log('API key cookie detected, reloading...')
            localStorage.apiKey = changeInfo.cookie.value
            
            // Clear the signed-out state
            delete localStorage.hasShownSignInNotification
            
            // Trigger a reload of the main function
            if (typeof main === 'function') {
                console.log('Calling main() to reload')
                main()
            } else {
                console.error('main function not found')
            }
            
            // Notify all pages
            notifyPbUpdate()
        }
    })
} else {
    console.error('chrome.cookies.onChanged not available')
}

// Note: Periodic cookie checking removed because Firefox blocks all cookie access
// The extension now relies on:
// 1. Content script (content-script.js) that runs on pushbullet.com pages
// 2. Manual API key entry via the sign-in prompt

// Debug: Log current state on load
console.log('Background wrapper loaded')
console.log('localStorage.apiKey:', localStorage.apiKey)
console.log('pb.local:', pb.local)
console.log('pb.settings:', pb.settings)
