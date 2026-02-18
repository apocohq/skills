/**
 * Gmail Multi-Inbox Setup Script
 *
 * HOW TO USE:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this entire script
 * 4. In the left sidebar, click + next to "Services" and enable "Gmail API"
 * 5. Run setupAll()
 * 6. Authorize when prompted (it needs Gmail access)
 *
 * TO ADD NEW SENDERS LATER:
 * - Add the sender domain/address to the appropriate array below
 * - Run setupAll() again (it's safe to re-run, won't duplicate)
 *
 * AFTER RUNNING THIS SCRIPT, configure Multiple Inboxes in Gmail:
 * Go to Gmail Settings > Inbox > Inbox type > Multiple Inboxes
 * __MULTI_INBOX_CONFIG__
 */

// ============================================================
// EDIT THESE LISTS TO ADD/REMOVE SENDERS
// ============================================================

__SENDER_ARRAYS__

// ============================================================
// SCRIPT LOGIC — no need to edit below this line
// ============================================================

function setupAll() {
  Logger.log('=== Gmail Multi-Inbox Setup ===');

  // Create labels
__LABEL_CONFIGS__

  // Create filters and retroactively label existing emails
__FILTER_CREATION__

  Logger.log('=== Done! Now configure Multiple Inboxes in Gmail Settings. ===');
}

function createLabelIfNeeded(labelName) {
  var label = GmailApp.getUserLabelByName(labelName);
  if (label) {
    Logger.log('Label "' + labelName + '" already exists.');
  } else {
    GmailApp.createLabel(labelName);
    Logger.log('Created label "' + labelName + '".');
  }
}

function createFilterIfNeeded(senderDomain, labelName) {
  var filter = {
    criteria: {
      from: senderDomain
    },
    action: {
      addLabelIds: [getLabelId(labelName)],
      removeLabelIds: []
    }
  };

  try {
    Gmail.Users.Settings.Filters.create(filter, 'me');
    Logger.log('Created filter: from:' + senderDomain + ' → ' + labelName);
  } catch (e) {
    if (e.message && e.message.indexOf('Filter already exists') > -1) {
      Logger.log('Filter already exists: from:' + senderDomain + ' → ' + labelName);
    } else {
      Logger.log('Error creating filter for ' + senderDomain + ': ' + e.message);
    }
  }
}

function getLabelId(labelName) {
  var labels = Gmail.Users.Labels.list('me').labels;
  for (var i = 0; i < labels.length; i++) {
    if (labels[i].name === labelName) {
      return labels[i].id;
    }
  }
  throw new Error('Label not found: ' + labelName + '. Make sure createLabelIfNeeded ran first.');
}

function retroLabel(senderList, labelName, options) {
  options = options || {};
  var label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    Logger.log('Label "' + labelName + '" not found, skipping retro-label.');
    return;
  }

  senderList.forEach(function(sender) {
    var query = 'from:' + sender + ' -label:' + labelName;
    var threads = GmailApp.search(query, 0, 100);
    if (threads.length > 0) {
      label.addToThreads(threads);
      Logger.log('Labeled ' + threads.length + ' existing threads from ' + sender + ' as ' + labelName);
    } else {
      Logger.log('No unlabeled threads found from ' + sender);
    }
  });

  // For work/company labels, also catch emails TO and CC the domain
  if (options.matchToAndCc) {
    options.matchToAndCc.forEach(function(domain) {
      var toQuery = 'to:' + domain + ' -label:' + labelName;
      var toThreads = GmailApp.search(toQuery, 0, 100);
      if (toThreads.length > 0) {
        label.addToThreads(toThreads);
        Logger.log('Labeled ' + toThreads.length + ' threads to ' + domain + ' as ' + labelName);
      }

      var ccQuery = 'cc:' + domain + ' -label:' + labelName;
      var ccThreads = GmailApp.search(ccQuery, 0, 100);
      if (ccThreads.length > 0) {
        label.addToThreads(ccThreads);
        Logger.log('Labeled ' + ccThreads.length + ' threads cc ' + domain + ' as ' + labelName);
      }
    });
  }
}
