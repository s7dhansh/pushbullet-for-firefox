'use strict'

// This content script runs on pushbullet.com pages
// It can access cookies via document.cookie

console.log('Pushbullet content script loaded')

// Function to extract API key from cookies
function getApiKeyFromCookies() {
    var cookies = document.cookie.split(';')
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim()
        if (cookie.startsWith('api_key=')) {
            return cookie.substring('api_key='.length)
        }
    }
    return null
}

// Check for API key on page load
var apiKey = getApiKeyFromCookies()
if (apiKey) {
    console.log('Found API key in cookies, sending to extension')
    chrome.runtime.sendMessage({
        type: 'apiKeyFound',
        apiKey: apiKey
    }).catch(function(e) {
        console.error('Error sending API key:', e)
    })
}

// Monitor for cookie changes
var lastApiKey = apiKey
setInterval(function() {
    var currentApiKey = getApiKeyFromCookies()
    if (currentApiKey && currentApiKey !== lastApiKey) {
        console.log('API key changed, sending to extension')
        lastApiKey = currentApiKey
        chrome.runtime.sendMessage({
            type: 'apiKeyFound',
            apiKey: currentApiKey
        }).catch(function(e) {
            console.error('Error sending API key:', e)
        })
    }
}, 1000)
