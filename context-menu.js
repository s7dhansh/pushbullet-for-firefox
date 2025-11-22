'use strict'

// Store menu item data for click handling
var contextMenuData = {}

pb.addEventListener('signed_in', function(e) {
    pb.addEventListener('locals_changed', function(e) {
        pb.updateContextMenu()
    })
})

// Set up click listener once
if (chrome.contextMenus.onClicked) {
    chrome.contextMenus.onClicked.addListener(function(info, tab) {
        var menuId = info.menuItemId
        
        if (menuId === 'snooze') {
            pb.snooze()
            pb.updateContextMenu()
        } else if (menuId === 'unsnooze') {
            pb.unsnooze()
            pb.updateContextMenu()
        } else if (contextMenuData[menuId]) {
            contextMenuItemClicked(contextMenuData[menuId], info, tab)
        }
    })
}

pb.updateContextMenu = function() {
    chrome.contextMenus.removeAll()
    contextMenuData = {}

    try {
        if (pb.isSnoozed()) {
            chrome.contextMenus.create({
                'id': 'unsnooze',
                'title': chrome.i18n.getMessage('unsnooze'),
                'contexts': ['action']
            })
        } else {
            chrome.contextMenus.create({
                'id': 'snooze',
                'title': chrome.i18n.getMessage('snooze'),
                'contexts': ['action']
            })
        }
    } catch (e) { }

    if (!pb.settings.showContextMenu || !pb.local.devices) {
        return
    }

    var contexts = ['page', 'link', 'selection', 'image']

    var devices = utils.asArray(pb.local.devices).sort(function(a, b) {
        return b.created - a.created
    })

    devices.unshift({
        'name': chrome.i18n.getMessage('all_of_my_devices')
    })

    devices.forEach(function(target, index) {
        var menuId = 'device_' + index
        contextMenuData[menuId] = target
        chrome.contextMenus.create({
            'id': menuId,
            'title': utils.streamDisplayName(target),
            'contexts': contexts
        })
    })

    var chats = utils.asArray(pb.local.chats)
    utils.alphabetizeChats(chats)

    if (devices.length > 0 && chats.length > 0) {
        chrome.contextMenus.create({
            'id': 'separator_1',
            'type': 'separator',
            'contexts': contexts
        })
    }

    chats.forEach(function(target, index) {
        var menuId = 'chat_' + index
        contextMenuData[menuId] = target
        chrome.contextMenus.create({
            'id': menuId,
            'title': utils.streamDisplayName(target),
            'contexts': contexts
        })
    })

    var contextMenuItemClicked = function(target, info, tab) {
        var push = {}

        if (target.with) {
            push.email = target.with.email
        } else if (target.iden) {
            push.device_iden = target.iden
        }

        if (info.srcUrl) {
            utils.downloadImage(info.srcUrl, function(blob) {
                blob.name =  utils.imageNameFromUrl(info.srcUrl)
                push.file = blob
                pb.sendPush(push)
            })
            return
        } else if (info.linkUrl) {
            push.type = 'link'
            push.title = info.selectionText
            push.url = info.linkUrl
        } else if (info.selectionText) {
            push.type = 'note'
            push.body = info.selectionText
        } else {
            push.type = 'link'
            push.title = tab.title
            push.url = info.pageUrl
        }

        pb.sendPush(push)
    }
}
