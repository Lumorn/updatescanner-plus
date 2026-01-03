import {showAllChanges} from '/lib/main/main_url.js';
import {loadLanguageFromConfig, translate} from '/lib/util/i18n.js';

const NOTIFICATION_ID = 'updatescanner';

/**
 * Show an OS notification that webpage updates have been detected.
 *
 * @param {number} updateCount - Number of updates.
 */
export async function showNotification(updateCount) {
  await loadLanguageFromConfig();
  let message;
  if (updateCount === 0) {
    message = translate('notification.none');
  } else if (updateCount === 1) {
    message = translate('notification.single');
  } else {
    message = translate('notification.multi', {count: updateCount});
  }

  let clickMessage;
  if (updateCount == 0) {
    clickMessage = '';
  } else {
    clickMessage = translate('notification.click');
  }

  browser.notifications.create(NOTIFICATION_ID, {
    type: 'basic',
    title: translate('app.title'),
    iconUrl: 'images/updatescanner_48.png',
    message: '\n' + message + '\n' + clickMessage,
  });

  if (!browser.notifications.onClicked.hasListener(handleNotificationClick)) {
    browser.notifications.onClicked.addListener(handleNotificationClick);
  }

  // Send message to https://addons.mozilla.org/firefox/addon/notification-sound, if it's installed.
  try {
    await browser.runtime.sendMessage(
      '@notification-sound', 'new-notification');
  } catch (error) {
    // Ignore if the notification-sound extension isn't installed
  }
}


/**
 * Called when a notification is clicked.
 *
 * @param {string} id - ID of the notification.
 */
function handleNotificationClick(id) {
  if (id == NOTIFICATION_ID) {
    showAllChanges();
  }
}
