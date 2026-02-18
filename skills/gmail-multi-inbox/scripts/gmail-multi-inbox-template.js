/**
 * Gmail Multi-Inbox Setup Script
 *
 * HOW TO USE:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this entire script
 * 4. In the left sidebar, click + next to "Services" and enable "Gmail API"
 * 5. Run setupAll() and authorize when prompted
 *    (this creates labels, updates filters, and retro-labels existing emails)
 *
 * TO ADD OR REMOVE SENDERS:
 * - Add/remove sender domains in the appropriate array below
 * - Run setupAll() again
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

/**
 * Creates labels, updates filters, and removes stale filters.
 * Run this every time you change the sender lists.
 */
function setupAll() {
  Logger.log('=== Gmail Multi-Inbox Setup ===');

  // Create labels
__LABEL_CONFIGS__

  // Remove stale filters for senders that have been removed
__STALE_FILTER_CLEANUP__

  // Create filters for each sender
__FILTER_CREATION__

  // Retroactively label existing emails
  retroLabelAll();

  Logger.log('=== Done! Now configure Multiple Inboxes in Gmail Settings. ===');
}

/**
 * Labels existing/historical emails from the sender lists.
 * Run this on first setup or after adding new senders.
 * Not needed on every run — filters handle new incoming emails.
 */
function retroLabelAll() {
  Logger.log('=== Retroactively labeling existing emails ===');

__RETRO_LABEL__

  Logger.log('=== Retro-labeling done! ===');
}

function createLabelIfNeeded(labelName, color) {
  var existing = GmailApp.getUserLabelByName(labelName);
  if (existing) {
    Logger.log('Label "' + labelName + '" already exists.');
    // Update color if specified
    if (color) {
      Gmail.Users.Labels.update({ color: color }, 'me', getLabelId(labelName));
      Logger.log('Updated color for "' + labelName + '".');
    }
  } else {
    var labelBody = {
      name: labelName,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show'
    };
    if (color) labelBody.color = color;
    Gmail.Users.Labels.create(labelBody, 'me');
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

function removeStaleFilters(managedConfig) {
  Logger.log('--- Removing stale filters ---');
  var existingFilters = Gmail.Users.Settings.Filters.list('me').filter || [];

  // Build a map of labelId -> current sender list
  var managedLabels = {};
  managedConfig.forEach(function(config) {
    try {
      var labelId = getLabelId(config.label);
      managedLabels[labelId] = config.senders.map(function(s) { return s.toLowerCase(); });
    } catch (e) {
      // Label doesn't exist yet, nothing to clean up
    }
  });

  existingFilters.forEach(function(filter) {
    var addLabelIds = (filter.action && filter.action.addLabelIds) || [];
    var fromCriteria = filter.criteria && filter.criteria.from;
    if (!fromCriteria) return;

    for (var i = 0; i < addLabelIds.length; i++) {
      var labelId = addLabelIds[i];
      if (managedLabels[labelId]) {
        if (managedLabels[labelId].indexOf(fromCriteria.toLowerCase()) === -1) {
          try {
            Gmail.Users.Settings.Filters.remove('me', filter.id);
            Logger.log('Removed stale filter: from:' + fromCriteria);
          } catch (e) {
            Logger.log('Error removing filter for ' + fromCriteria + ': ' + e.message);
          }
        }
        break;
      }
    }
  });
}

function labelAllMatching(query, label) {
  var BATCH = 100;
  var total = 0;
  while (true) {
    var threads = GmailApp.search(query, 0, BATCH);
    if (threads.length === 0) break;
    label.addToThreads(threads);
    total += threads.length;
    if (threads.length < BATCH) break;
  }
  return total;
}

function retroLabel(senderList, labelName, options) {
  options = options || {};
  var label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    Logger.log('Label "' + labelName + '" not found, skipping retro-label.');
    return;
  }

  senderList.forEach(function(sender) {
    var count = labelAllMatching('from:' + sender + ' -label:' + labelName, label);
    Logger.log(count > 0
      ? 'Labeled ' + count + ' existing threads from ' + sender + ' as ' + labelName
      : 'No unlabeled threads found from ' + sender);
  });

  // Also catch emails TO and CC the listed domains (useful for work/company labels)
  if (options.matchToAndCc) {
    options.matchToAndCc.forEach(function(domain) {
      var toCount = labelAllMatching('to:' + domain + ' -label:' + labelName, label);
      if (toCount > 0) Logger.log('Labeled ' + toCount + ' threads to ' + domain + ' as ' + labelName);

      var ccCount = labelAllMatching('cc:' + domain + ' -label:' + labelName, label);
      if (ccCount > 0) Logger.log('Labeled ' + ccCount + ' threads cc ' + domain + ' as ' + labelName);
    });
  }
}
