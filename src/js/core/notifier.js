'use strict'

pb.notifier = {
		'active': {}
}

var listenersSetUp

try {
		pb.alertSound = new Audio('/assets/sounds/alert.ogg')
} catch (e) {
		pb.alertSound = {
				'play': function() {
						pb.log('Unable to play sound')
				}
		}
}

// Helper function to detect OTP codes in text
var detectOTP = function(text) {
		if (!text) return null

		// Common OTP patterns:
		// - 4-8 digit numbers
		// - Often preceded by keywords like "code", "OTP", "verification", etc.
		var patterns = [
				/(?:code|otp|verification|verify|pin|password|passcode|token)[\s:]*(\d{4,8})/i,
				/\b(\d{6})\b/,	// 6-digit codes (most common)
				/\b(\d{4})\b/,	// 4-digit codes
				/\b(\d{5})\b/,	// 5-digit codes
				/\b(\d{7,8})\b/ // 7-8 digit codes
		]

		for (var i = 0; i < patterns.length; i++) {
				var match = text.match(patterns[i])
				if (match) {
						return match[1] || match[0]
				}
		}

		return null
}

pb.notifier.show = function(options) {
		pb.log('Showing notification with key ' + options.key)

		options.allButtons = options.buttons
		options.fullMessage = options.message
		options.allItems = options.items

		// Detect OTP in message
		var otpCode = detectOTP(options.message) || detectOTP(options.title)
		if (otpCode) {
				console.log('OTP detected:', otpCode)
				options.otpCode = otpCode
				// Prepend OTP to title for visibility
				options.title = '🔐 ' + otpCode + ' - ' + (options.title || 'Verification Code')

				// Store the original onclick handler
				var originalOnclick = options.onclick

				// Override onclick to copy OTP when notification is clicked
				options.onclick = function() {
						// Copy OTP using execCommand as fallback for background context
						var textArea = document.createElement('textarea')
						textArea.value = otpCode
						textArea.style.position = 'fixed'
						textArea.style.left = '-999999px'
						document.body.appendChild(textArea)
						textArea.select()

						try {
								document.execCommand('copy')
								pb.log('OTP copied to clipboard: ' + otpCode)
								console.log('OTP copied:', otpCode)
						} catch (err) {
								console.error('Failed to copy OTP:', err)
						}

						document.body.removeChild(textArea)

						// Call original onclick if it exists
						if (originalOnclick) {
								originalOnclick()
						}
				}
		}

		if (pb.settings.onlyShowTitles) {
				if (options.type == 'list') {
						options.items = []
				}

				options.message = ''
		}

		if (pb.settings.showMirrors) {
				if (pb.isSnoozed()) {
						pb.log('Not showing notification ' + options.key + ', snoozed')
						return
				}

				notify(options)

				if (options.key != 'update') {
						pb.dispatchEvent('active')
				}
		}

		pb.notifier.active[options.key] = options

		pb.dispatchEvent('notifications_changed')
}

var notify = function(options) {
		if (!listenersSetUp) {
				setUpNotificationListeners()
				listenersSetUp = true
		}

		options.created = Date.now()

		var spec = { }
		spec.type = options.type
		spec.title = options.title || ''
		spec.message = options.message || ''
		spec.iconUrl = options.iconUrl

		if (options.contextMessage) {
				spec.contextMessage = options.contextMessage
		}

		if (options.items) {
				spec.items = options.items
		}

		if (options.imageUrl) {
				spec.imageUrl = options.imageUrl
		}

		if (!options.priority && pb.settings.notificationDuration == 0) {
				options.priority = 2
		}

		spec.priority = options.priority

		if (pb.browserVersion >= 40) {
				spec.isClickable = true
		}

		// Keep notification visible longer by requiring interaction
		// This prevents auto-dismiss on most platforms
		// Note: Firefox may ignore this, but we'll try anyway
		spec.requireInteraction = true

		if (options.buttons) {
				if (options.buttons.length > 2) {
						var buttons = options.buttons
						options.buttons = []

						var lastButton = buttons.pop()
						options.buttons.push(lastButton)

						var labels = []
						buttons.forEach(function(button) {
								labels.unshift(button.short_title || button.title)
						})

						buttons.push(lastButton)

						var title = labels.join(', ')

						options.buttons.unshift({
								'title': title,
								'iconUrl': '/assets/images/action_overflow.png',
								'onclick': function() {
										openMore(options)
								}
						})
				}

				spec.buttons = []
				options.buttons.forEach(function(button) {
						spec.buttons.push({
								'title': button.title,
								'iconUrl': button.iconUrl
						})
				})
		}

		if (pb.browser == 'opera') {
				delete spec.buttons
				delete spec.isClickable
		}

		if (pb.browser == 'firefox') {
				var validKeys = ['type', 'title', 'iconUrl', 'title', 'message']
				Object.keys(spec).forEach(function(key) {
						if (key == 'items') {
								spec.message = spec.items.join('\n')
						}
						if (validKeys.indexOf(key) == -1) {
								delete spec[key]
						}
				})
		}

		var moreWindow = moreWindows[options.key]
		if (moreWindow) {
				chrome.windows.remove(moreWindow)
		}

		var existing = pb.notifier.active[options.key]

		if (existing && pb.browser != 'firefox' && ((Date.now() - existing.created < timeOnScreen(existing)) || options.collapse)) {
				pb.notifier.active[options.key] = options
				chrome.notifications.update(options.key, spec, function() { })
		} else {
				var notificationCreated = function() {
						pb.notifier.active[options.key] = options
						if (pb.settings.playSound) {
								pb.alertSound.play()
						}

						// Auto-dismiss after specified duration if requireInteraction is not supported
						if (pb.browser === 'firefox' && options.key !== 'update') {
								setTimeout(function() {
										chrome.notifications.clear(options.key, function() {})
								}, timeOnScreen(options))
						}
				}

				var createNotification = function() {
						chrome.notifications.create(options.key, spec, function() {
								if (chrome.runtime.lastError) {
										pb.log(chrome.runtime.lastError)
								}
								notificationCreated()
						})
				}

				if (existing) {
						existing.onclose = null
				}

				chrome.notifications.clear(options.key, function() {
						createNotification()
				})
		}
}

var timeOnScreen = function(options) {
		return options.priority && options.priority > 0 ? 25 * 1000 : 15 * 1000
}

pb.notifier.dismiss = function(key) {
		chrome.notifications.clear(key, function(wasCleared) {
				pb.log('Dismissed ' + key)
				delete pb.notifier.active[key]
				pb.dispatchEvent('notifications_changed')
		})

		var moreWindow = moreWindows[key]
		if (moreWindow) {
				chrome.windows.remove(moreWindow)
		}
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
// Set up the listeners for clicks and closes
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

var setUpNotificationListeners = function() {
		chrome.notifications.onClicked.addListener(function(key) {
				utils.wrap(function() {
						var notification = pb.notifier.active[key]
						if (notification) {
								if (notification.onclick) {
										notification.onclick()
								}

								if (notification.onclose) {
										notification.onclose()
								}

								delete pb.notifier.active[key]
								pb.dispatchEvent('notifications_changed')
						}

						chrome.notifications.clear(key, function(wasCleared) {
						})
				})
		})

		chrome.notifications.onClosed.addListener(function(key, byUser) {
				utils.wrap(function() {
						if (pb.browser == 'chrome' && pb.browserVersion < 63) {
								return
						}

						if (pb.browser == 'firefox') {
								// byUser is not supported by Firefox
								return
						}

						var notification = pb.notifier.active[key]
						if (notification && byUser) {
								if (notification.onclose) {
										notification.onclose()
								}

								delete pb.notifier.active[key]
								pb.dispatchEvent('notifications_changed')
						}
				})
		})

		chrome.notifications.onButtonClicked.addListener(function(key, index) {
				utils.wrap(function() {
						var notification = pb.notifier.active[key]
						if (notification) {
								// bugfix for chrome 68 + windows 10 native notifications calling through with
								// button index -1 when the main notification is clicked
								if (index < 0) {
										notification.onclick()
								} else {
										notification.buttons[index].onclick()
								}

								if (notification.onclose) {
										notification.onclose()
								}

								delete pb.notifier.active[key]
								pb.dispatchEvent('notifications_changed')
						}

						chrome.notifications.clear(key, function(wasCleared) {
						})
				})
		})
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
// Power the "More" popup
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

var moreWindows = {}
var moreOptions = {}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if (message.type == 'more_get_options') {
				sendResponse(moreOptions[sender.tab.windowId])
		} else if (message.type == 'more_main_click') {
				moreOptions[sender.tab.windowId].onclick()
				chrome.windows.remove(sender.tab.windowId)
		} else if (message.type == 'more_button_click') {
				moreOptions[sender.tab.windowId].allButtons[message.index].onclick()
				chrome.windows.remove(sender.tab.windowId)
		}
})

chrome.windows.onRemoved.addListener(function(windowId) {
		var options = moreOptions[windowId]
		if (options) {
				delete moreWindows[options.key]
				delete moreOptions[windowId]
		}
})

var openMore = function(options) {
		var width = 360
		var height = 260

		// Position the More window based on the platform
		// Mac in top-right, Windows in bottom-right
		var top
		if (navigator.platform.indexOf('Mac') >= 0) {
				top = 40
		} else {
				top = screen.availHeight - height - 110
		}

		var left = screen.availWidth - width - 20

		var spec = {
				'type': 'popup',
				'url': 'more.html?key=' + options.key,
				'width': width,
				'height': height,
				'top': top,
				'left': left
		}

		chrome.windows.create(spec, function(w) {
				moreWindows[options.key] = w.id
				moreOptions[w.id] = options
				chrome.windows.update(w.id, { 'focused': true }, function() {
				})
		})
}
