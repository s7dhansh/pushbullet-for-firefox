'use strict'

pb.addEventListener('signed_in', function(e) {
    pb.updateIcon()

    pb.addEventListener('notifications_changed', function(e) {
        pb.updateIcon()
    })
})

// Listen for system theme changes
if (window.matchMedia) {
    var darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    var handleThemeChange = function(e) {
        // Only auto-update if user hasn't explicitly set a preference
        if (localStorage['darkMode'] === undefined || localStorage['darkMode'] === 'undefined') {
            pb.settings.darkMode = e.matches
            pb.saveSettings()
            
            // Notify all pages to update their theme
            chrome.runtime.sendMessage({
                type: 'themeChanged',
                darkMode: e.matches
            }).catch(function() {
                // Ignore errors if no pages are listening
            })
        }
    }
    
    // Modern browsers
    if (darkModeMediaQuery.addEventListener) {
        darkModeMediaQuery.addEventListener('change', handleThemeChange)
    } else if (darkModeMediaQuery.addListener) {
        // Older browsers
        darkModeMediaQuery.addListener(handleThemeChange)
    }
}

pb.getSystemDarkMode = function() {
    if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
}

pb.loadSettings = function() {
    // Use system theme if darkMode hasn't been explicitly set
    var darkMode
    
    // One-time migration: if darkMode was set to false by default, reset to system preference
    if (!localStorage['darkModeUserSet'] && localStorage['darkMode'] === 'false') {
        delete localStorage['darkMode']
    }
    
    // Check if this is the first time or if user wants to reset to system theme
    if (!localStorage['darkMode'] || localStorage['darkMode'] === 'undefined' || localStorage['darkMode'] === 'null') {
        darkMode = pb.getSystemDarkMode()
        // Save it so we know it's been set
        localStorage['darkMode'] = darkMode
    } else {
        darkMode = localStorage['darkMode'] === 'true'
    }
    
    pb.settings = {
        'darkMode': darkMode,
        'openMyLinksAutomatically': localStorage['openMyLinksAutomatically'] !== 'false',
        'onlyShowTitles': localStorage['onlyShowTitles'] === 'true',
        'useDarkIcon': localStorage['useDarkIcon'] === 'true',
        'playSound': localStorage['playSound'] === 'true',
        'showMirrors': localStorage['showMirrors'] !== 'false',
        'showContextMenu': localStorage['showContextMenu'] !== 'false',
        'notificationDuration': parseInt(localStorage['notificationDuration']) || 0,
        'snoozedUntil': localStorage['snoozedUntil'] ? parseInt(localStorage['snoozedUntil']) || 0 : 0,
        'showNotificationCount': localStorage['showNotificationCount'] !== 'false',
        'hideSignInReminder': localStorage['hideSignInReminder'] === 'true',
        'allowInstantPush': localStorage['allowInstantPush'] === 'true',
        'instantPushIden': localStorage['instantPushIden'],
        'automaticallyAttachLink': localStorage['automaticallyAttachLink'] !== 'false',
        'disableAnalytics': localStorage['disableAnalytics'] === 'true',
        'needsDataApproval': localStorage['needsDataApproval'] === 'true'
    }

    pb.updateContextMenu()
    pb.updateIcon()

    clearTimeout(pb.snoozeTimeout)
    if (pb.isSnoozed()) {
        pb.snoozeTimeout = setTimeout(function() {
            delete localStorage.snoozedUntil
            pb.loadSettings()
        }, localStorage.snoozedUntil - Date.now())
    }
}

pb.saveSettings = function() {
    Object.keys(pb.settings).forEach(function(key) {
        localStorage[key] = pb.settings[key]
    })

    pb.dispatchEvent('notifications_changed')
}

pb.snooze = function() {
    localStorage.snoozedUntil = Date.now() + (60 * 60 * 1000)
    pb.loadSettings()
}

pb.unsnooze = function() {
    delete localStorage.snoozedUntil
    pb.loadSettings()
}

pb.isSnoozed = function() {
    return pb.settings.snoozedUntil > Date.now()
}

pb.updateIcon = function() {
    var action = chrome.action || chrome.browserAction
    
    if (!localStorage.apiKey) {
        action.setBadgeBackgroundColor({ 'color': '#e85845' })
        action.setBadgeText({ 'text': '1' })
        return
    }

    if (pb.settings.useDarkIcon) {
        action.setIcon({
            'path': {
                '19': 'icon_19_gray.png',
                '38': 'icon_38_gray.png'
            }
        })
    } else {
        action.setIcon({
            'path': {
                '19': 'icon_19.png',
                '38': 'icon_38.png'
            }
        })
    }

    if (pb.isSnoozed()) {
        action.setBadgeText({ 'text': 'zzz' })

        if (pb.settings.useDarkIcon) {
            action.setBadgeBackgroundColor({ 'color': '#76c064' })
        } else {
            action.setBadgeBackgroundColor({ 'color': '#4a4a4a' })
        }
    } else {
        var notificationCount = Object.keys(pb.notifier.active).length
        action.setBadgeText({
            'text': (notificationCount > 0 && pb.settings.showNotificationCount) ? '' + notificationCount : ''
        })

        if (pb.settings.useDarkIcon) {
            action.setBadgeBackgroundColor({ 'color': '#4ab367' })
        } else {
            action.setBadgeBackgroundColor({ 'color': '#e85845' })
        }
    }
}
