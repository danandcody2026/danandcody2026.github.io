function updateCountdown() {
  const eventDate = new Date('2026-06-13T00:00:00');
  const now = new Date();
  const diff = eventDate - now;

  if (diff <= 0) {
    document.getElementById('countdown').textContent = "It's the big day!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById('countdown').textContent = `${days} DAYS TO GO!`;
}
updateCountdown();
setInterval(updateCountdown, 60 * 1000);

// alert_markup
function alert_markup(alert_type, msg) {
    let bgColor, textColor;
    if (alert_type === 'success') {
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
    } else if (alert_type === 'danger') {
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
    } else { // 'info'
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-700';
    }
    return `<div class="p-4 rounded-md mt-4 ${bgColor} ${textColor}">${msg}</div>`;
}

/********************** RSVP Multi-Guest Form **********************/
$(document).ready(function() {
    var guestCount = 1;

    // Show/hide extra fields based on attending radio
    $('#rsvp-form').on('change', 'input[name^="attending"]', function() {
        var $card = $(this).closest('.guest-card');
        var val = $(this).val();
        var $extra = $card.find('.guest-extra-fields');
        if (val === 'Yes') {
            $extra.slideDown(150).removeClass('hidden');
        } else {
            $extra.slideUp(150);
            $card.find('.dietary-options input[type="checkbox"]').prop('checked', false);
            $card.find('.dietary-other-text').val('');
            $card.find('.dietary-error').addClass('hidden');
        }
        updateAccomSection();
    });

    // Pasty flavour/none — show or hide size section (delegated)
    $('#rsvp-form').on('change', '.pasty-flavour', function() {
        $(this).closest('.guest-card').find('.pasty-size-section').slideDown(150).removeClass('hidden');
    });
    $('#rsvp-form').on('change', '.pasty-none', function() {
        var $card = $(this).closest('.guest-card');
        $card.find('.pasty-size-section').slideUp(150);
        $card.find('.pasty-size-section input[type="radio"]').prop('checked', false);
    });

    function updateAccomSection() {
        var data = JSON.parse(sessionStorage.getItem('guestData') || '{}');
        if (data.type !== 'onsite') return;
        var anyAttending = $('#guest-cards input[name^="attending"][value="Yes"]:checked').length > 0;
        var $accom = $('#accom-section');
        if (anyAttending) {
            $accom.removeClass('hidden').slideDown(150);
        } else {
            $accom.slideUp(150, function() { $(this).addClass('hidden'); });
            $('.accom-night-check').prop('checked', false);
            $('#accom-total-line').addClass('hidden');
        }
    }
    window.updateAccomSection = updateAccomSection;

    function validateForm(isOnsite, guestSessionData) {
        $('.rsvp-error-msg').remove();
        $('.rsvp-field-error').removeClass('rsvp-field-error');
        var firstError = null;
        var valid = true;

        function markError($el, msg) {
            $el.addClass('rsvp-field-error');
            if (!$el.find('.rsvp-error-msg').length) {
                $el.append('<p class="rsvp-error-msg text-red-500 text-sm mt-1">' + msg + '</p>');
            }
            if (!firstError) firstError = $el;
            valid = false;
        }

        $('#guest-cards .guest-card').each(function() {
            var $card = $(this);
            var attending = $card.find('input[name^="attending"]:checked').val();
            if (!attending) {
                markError($card.find('input[name^="attending"]').closest('.mb-4'), 'Please let us know if you can make it.');
            }
            if (attending === 'Yes') {
                var pasty = $card.find('input[name^="pasty"]:not([name^="pasty_size"]):checked').val();
                if (!pasty) {
                    markError($card.find('input[name^="pasty"]').first().closest('.mb-4'), 'Please choose a pasty option.');
                }
                if (pasty && pasty !== 'No pasty' && !$card.find('input[name^="pasty_size"]:checked').val()) {
                    markError($card.find('.pasty-size-section'), 'Please choose a size.');
                }
            }
        });

        if (isOnsite && $('#accom-section').is(':visible') && $('.accom-night-check:checked').length === 0) {
            markError($('#accom-section').find('.flex.flex-col'), 'Please select at least one night.');
        }

        if (firstError) {
            $('html, body').animate({ scrollTop: firstError.offset().top - 120 }, 400);
        }
        return valid;
    }

    // Dietary checkbox mutual exclusivity (delegated for dynamic cards)
    $('#rsvp-form').on('change', '.dietary-none', function() {
        var $card = $(this).closest('.guest-card');
        if ($(this).is(':checked')) {
            $card.find('.dietary-other-opt').prop('checked', false);
            $card.find('.dietary-other-text').val('');
        }
    });
    $('#rsvp-form').on('change', '.dietary-other-opt', function() {
        var $card = $(this).closest('.guest-card');
        if ($(this).is(':checked')) {
            $card.find('.dietary-none').prop('checked', false);
        }
    });
    // Clear error state when a field is interacted with
    $('#rsvp-form').on('change', 'input, textarea', function() {
        var $errorEl = $(this).closest('.rsvp-field-error');
        if ($errorEl.length) {
            $errorEl.removeClass('rsvp-field-error');
            $errorEl.find('.rsvp-error-msg').remove();
        }
    });

    // Show/hide "Other" text box
    $('#rsvp-form').on('change', '.dietary-other-check', function() {
        var $card = $(this).closest('.guest-card');
        var $otherText = $card.find('.dietary-other-text');
        if ($(this).is(':checked')) {
            $otherText.removeClass('hidden');
        } else {
            $otherText.addClass('hidden').val('');
        }
    });

    // Add guest button
    $('#add-guest-btn').on('click', function() {
        guestCount++;
        var n = guestCount;
        var cardHtml =
            '<div class="guest-card border border-gray-200 rounded-lg p-5 mb-6 bg-white" data-guest="' + n + '">' +
                '<div class="flex justify-between items-center mb-4">' +
                    '<h3 class="plan-heading text-lg tracking-wider text-[#223c6c]">GUEST ' + n + '</h3>' +
                    '<button type="button" class="remove-guest-btn text-red-400 hover:text-red-600 text-sm font-medium transition">Remove</button>' +
                '</div>' +
                '<div class="mb-4">' +
                    '<label class="block font-medium text-[#223c6c] mb-1">Guest name <span class="text-red-500">*</span></label>' +
                    '<input type="text" name="guest_name" class="find-more-input w-full p-3 rounded border border-gray-300" placeholder="e.g. John Smith" required>' +
                '</div>' +
                '<div class="mb-4">' +
                    '<label class="block font-medium text-[#223c6c] mb-1">Will you be attending? <span class="text-red-500">*</span></label>' +
                    '<div class="flex flex-row gap-4 mt-1">' +
                        '<label class="inline-flex items-center text-[#223c6c]">' +
                            '<input type="radio" name="attending_' + n + '" value="Yes" class="accent-[#223c6c] mr-1" required> Yes, can\'t wait!' +
                        '</label>' +
                        '<label class="inline-flex items-center text-[#223c6c]">' +
                            '<input type="radio" name="attending_' + n + '" value="No" class="accent-[#223c6c] mr-1"> Sorry, can\'t make it' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="guest-extra-fields hidden">' +
                    '<div class="mb-4">' +
                        '<label class="block font-medium text-[#223c6c] mb-1">Any dietary requirements or allergies? <span class="font-normal text-sm opacity-70">(optional)</span></label>' +
                        '<div class="dietary-options flex flex-col gap-2 mt-2">' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Vegan" class="accent-[#223c6c] mr-2 dietary-other-opt"> Vegan</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Nut allergy" class="accent-[#223c6c] mr-2 dietary-other-opt"> Nut allergy</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Gluten free" class="accent-[#223c6c] mr-2 dietary-other-opt"> Gluten free</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Celiac" class="accent-[#223c6c] mr-2 dietary-other-opt"> Celiac</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Soya bean allergy" class="accent-[#223c6c] mr-2 dietary-other-opt"> Soya bean allergy</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Other" class="accent-[#223c6c] mr-2 dietary-other-opt dietary-other-check"> Other (please specify):</label>' +
                            '<input type="text" name="dietary_other_' + n + '" class="find-more-input w-full p-3 rounded border border-gray-300 ml-6 dietary-other-text hidden" placeholder="Please specify...">' +
                        '</div>' +
                    '</div>' +
                    '<div class="mb-4">' +
                        '<label class="block font-medium text-[#223c6c] mb-1">What is your pasty of choice? <span class="text-red-500">*</span></label>' +
                        '<div class="flex flex-col gap-2 mt-2">' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="radio" name="pasty_' + n + '" value="Steak" class="accent-[#223c6c] mr-2 pasty-flavour" required> Steak</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="radio" name="pasty_' + n + '" value="Cheese & Onion" class="accent-[#223c6c] mr-2 pasty-flavour"> Cheese & Onion</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="radio" name="pasty_' + n + '" value="Vegetable" class="accent-[#223c6c] mr-2 pasty-flavour"> Vegetable</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="radio" name="pasty_' + n + '" value="No pasty" class="accent-[#223c6c] mr-2 pasty-none"> No pasty</label>' +
                        '</div>' +
                        '<div class="pasty-size-section mt-3 hidden">' +
                            '<label class="block font-medium text-[#223c6c] mb-1">What size? <span class="text-red-500">*</span></label>' +
                            '<div class="flex flex-row gap-4 mt-1">' +
                                '<label class="inline-flex items-center text-[#223c6c]"><input type="radio" name="pasty_size_' + n + '" value="Small" class="accent-[#223c6c] mr-2"> Small</label>' +
                                '<label class="inline-flex items-center text-[#223c6c]"><input type="radio" name="pasty_size_' + n + '" value="Medium" class="accent-[#223c6c] mr-2"> Medium</label>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="mb-4">' +
                        '<label class="block font-medium text-[#223c6c] mb-1">Any song requests for the dance floor?</label>' +
                        '<textarea name="songs_' + n + '" class="find-more-input w-full p-3 rounded border border-gray-300 song-field" rows="2" title="Any song requests for the dance floor?"></textarea>' +
                    '</div>' +
                    '<div>' +
                        '<label class="block font-medium text-[#223c6c] mb-1">Anything else we should know?</label>' +
                        '<textarea name="notes_' + n + '" class="find-more-input w-full p-3 rounded border border-gray-300" rows="3" title="Anything else we should know?"></textarea>' +
                    '</div>' +
                '</div>' +
            '</div>';

        $('#guest-cards').append(cardHtml);
        renumberCards();
    });

    // Remove guest (delegated)
    $('#guest-cards').on('click', '.remove-guest-btn', function() {
        $(this).closest('.guest-card').remove();
        renumberCards();
    });

    function renumberCards() {
        $('#guest-cards .guest-card').each(function(i) {
            $(this).find('h3').first().text('GUEST ' + (i + 1));
        });
    }

    // Form submission — sends one POST per guest so each is a separate row
    $('#rsvp-form').on('submit', function(e) {
        e.preventDefault();

        var guestSessionData = JSON.parse(sessionStorage.getItem('guestData') || '{}');
        var isOnsite = guestSessionData.type === 'onsite';

        if (!validateForm(isOnsite, guestSessionData)) return;

        // Collect accommodation nights (onsite only)
        var accomNights = [];
        if (isOnsite) {
            document.querySelectorAll('.accom-night-check:checked').forEach(function(cb) {
                accomNights.push(cb.value);
            });
        }

        // Collect guest data
        var guests = [];
        var timestamp = new Date().toISOString();
        $('#guest-cards .guest-card').each(function() {
            var $card = $(this);
            var nameInput = $card.find('input[name="guest_name"]');
            var name = nameInput.length ? nameInput.val().trim() : $card.find('h3').first().text().trim();
            var attending = $card.find('input[name^="attending"]:checked').val() || '';

            // Build dietary
            var dietaryParts = [];
            $card.find('.dietary-options input[type="checkbox"]:checked').each(function() {
                dietaryParts.push($(this).val());
            });
            var otherText = $card.find('.dietary-other-text').val().trim();
            if ($card.find('.dietary-other-check').is(':checked') && otherText) {
                dietaryParts = dietaryParts.map(function(v) {
                    return v === 'Other' ? 'Other: ' + otherText : v;
                });
            }
            var dietary = dietaryParts.length > 0 ? dietaryParts.join(', ') : 'None';

            var pasty = $card.find('input[name^="pasty"]:not([name^="pasty_size"]):checked').val() || '';
            var pastySize = $card.find('input[name^="pasty_size"]:checked').val() || '';
            var pastyFull = pasty === 'No pasty' ? 'No pasty' : (pasty && pastySize ? pasty + ' (' + pastySize + ')' : pasty);
            var notes = $card.find('textarea[name^="notes"]').val().trim();
            var songs = $card.find('textarea[name^="songs"]').val().trim();

            var cost = '';
            if (isOnsite && accomNights.length > 0 && guestSessionData.cost) {
                cost = '£' + (parseFloat(guestSessionData.cost) * accomNights.length).toFixed(2);
            }

            guests.push({
                timestamp: timestamp,
                name: name,
                attending: attending,
                dietary: dietary,
                pasty: pastyFull,
                nights: accomNights.join(', ') || '',
                cost: cost,
                songs: songs,
                notes: notes
            });
        });

        // For onsite guests, show confirmation modal with total before submitting
        if (isOnsite && accomNights.length > 0 && guestSessionData.cost) {
            var rate = parseFloat(guestSessionData.cost);
            var total = rate * accomNights.length;
            $('#modal-accom-total').text('£' + total.toFixed(2));
            $('#rsvp-modal').removeClass('hidden');

            $('#rsvp-modal-confirm').off('click').on('click', function() {
                $('#rsvp-modal').addClass('hidden');
                doRsvpSubmit(guests, isOnsite, accomNights, guestSessionData);
            });
            $('#rsvp-modal-close, #rsvp-modal-backdrop').off('click').on('click', function() {
                $('#rsvp-modal').addClass('hidden');
            });
            return;
        }

        doRsvpSubmit(guests, isOnsite, accomNights, guestSessionData);
    });

    // Auto-populate guest cards from invite code guestName
    var rsvpGuestsInitialized = false;
    function initRsvpGuests() {
        if (rsvpGuestsInitialized) return;
        var data = JSON.parse(sessionStorage.getItem('guestData') || '{}');
        if (!data.guestName) return;
        rsvpGuestsInitialized = true;

        // Parse "Name", "Name1 and Name2", "Name1, Name2 and Name3"
        var names = data.guestName
            .replace(/ and /gi, ', ')
            .split(',')
            .map(function(n) { return n.trim(); })
            .filter(Boolean);

        if (names.length === 0) return;

        // Add extra cards first — renumberCards() runs inside the click handler
        // and would overwrite any headings we set early
        for (var i = 1; i < names.length; i++) {
            $('#add-guest-btn').trigger('click');
        }

        // Now set headings and strip name inputs on all cards
        $('#guest-cards .guest-card').each(function(idx) {
            if (idx >= names.length) return;
            $(this).find('h3').first().text(names[idx]);
            $(this).find('input[name="guest_name"]').closest('.mb-4').remove();
            if (idx > 0) $(this).find('.remove-guest-btn').remove();
        });

        // Hide the add-guest button — party size is fixed by the invite
        $('#add-guest-btn').hide();

        // Ensure accommodation section reflects current attendance state
        updateAccomSection();
    }

    // Run on page load if already logged in
    initRsvpGuests();
    // Also run when the user logs in mid-session
    window.addEventListener('guestDataReady', initRsvpGuests);

    function doRsvpSubmit(guests, isOnsite, accomNights, guestSessionData, attempt) {
        attempt = attempt || 1;
        $('#rsvp-alert-wrapper').html(alert_markup('info', attempt === 1 ? '<strong>Just a sec!</strong> Sending your RSVP...' : '<strong>Just a sec!</strong> Retrying...'));

        // Send all guests as JSON
        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbwTe8PSs7fB3BM44_1LutloKVrA0TYdby0fPpLjHTn7J97LPP_0EoOz_eYd2lohPQr7/exec',
            method: 'POST',
            data: JSON.stringify({ guests: guests }),
            contentType: 'text/plain',
            dataType: 'json',
            timeout: 15000
        })
        .done(function(response) {
            console.log(response);
            if (response.result === 'error') {
                $('#rsvp-alert-wrapper').html(alert_markup('danger', response.message));
            } else {
                // Reset: remove extra cards, clear the first one, then re-populate names
                $('#guest-cards .guest-card:not(:first)').remove();
                $('#rsvp-form')[0].reset();
                rsvpGuestsInitialized = false;
                initRsvpGuests();
                $('#rsvp-alert-wrapper').html(alert_markup('success', '<strong>Thank you!</strong> Your RSVP has been received. We can\'t wait to celebrate with you! If you need to make any changes, just submit the form again.'));

                // For onsite guests, open Monzo for accommodation payment
                if (isOnsite && accomNights.length > 0 && guestSessionData.cost) {
                    var rate = parseFloat(guestSessionData.cost);
                    var total = rate * accomNights.length;
                    var PAYEES = [
                        { base: 'https://monzo.me/danielbeechey', h: 'LonNoz' },
                        { base: 'https://monzo.me/codyvarnish', h: 'jtBOVc' }
                    ];
                    var payee = PAYEES[Math.random() < 0.5 ? 0 : 1];
                    var params = new URLSearchParams({ h: payee.h, d: 'accommodation' });
                    window.open(payee.base + '/' + total.toFixed(2) + '?' + params.toString(), '_blank', 'noopener,noreferrer');
                }
            }
        })
        .fail(function(err) {
            if (attempt < 2) {
                setTimeout(function() {
                    doRsvpSubmit(guests, isOnsite, accomNights, guestSessionData, attempt + 1);
                }, 2000);
            } else {
                console.log(err);
                $('#rsvp-alert-wrapper').html(alert_markup('danger', '<strong>Sorry!</strong> Something went wrong. Please try again or contact us directly.'));
            }
        });
    }
});

// Smooth scroll for in-page anchor links
$(document).on('click', 'a[href^="#"]', function (e) {
  var target = $(this.getAttribute('href'));
  if (target.length) {
    e.preventDefault();
    $('html, body').animate({
      scrollTop: target.offset().top
    }, 1000); // 1000ms matches a smooth scroll feel
  }
});

/********************** Global Invite Code System **********************/
(function() {
  // Validation endpoint — your Google Apps Script web app URL
  var VALIDATE_URL = 'https://script.google.com/macros/s/AKfycbzjCHc-zirkJsiOUAL1xdxu6pwxiUK8J_LSiFUMH_HERgUECFyI5vyLgHDWPG3Yss7YfA/exec';

  var overlay = document.getElementById('invite-overlay');
  var badge   = document.getElementById('invite-badge');
  if (!overlay || !badge) return; // safety check

  var overlayInput = document.getElementById('overlay-invite-input');
  var overlayBtn   = document.getElementById('overlay-invite-btn');
  var overlayError = document.getElementById('overlay-invite-error');
  var badgeCode    = document.getElementById('badge-code');
  var badgeLogout  = document.getElementById('badge-logout');

  function showSite(code, guestData) {
    overlay.classList.add('hidden');
    badge.classList.remove('hidden');
    // Prefer guest name on the badge; fall back to the code if missing
    badgeCode.textContent = (guestData && guestData.guestName) ? guestData.guestName : code;
    document.body.style.overflow = '';

    // Show/hide onsite-only content based on guest type
    var type = (guestData && guestData.type) ? guestData.type : null;
    document.querySelectorAll('.onsite-only').forEach(function(el) {
      el.style.display = (type === 'onsite') ? 'block' : 'none';
    });

    // Hide accommodation price line for complimentary guests (cost is 0 or not set)
    var priceLine = document.getElementById('accom-price-line');
    if (priceLine && guestData && (!guestData.cost || parseFloat(guestData.cost) === 0)) priceLine.style.display = 'none';

    // Store guest data for other pages
    if (guestData) {
      sessionStorage.setItem('guestData', JSON.stringify(guestData));
      window.GUEST_DATA = guestData;

      // Update RSVP submit button and wire up nights for onsite guests
      if (guestData.type === 'onsite') {
        var submitBtn = document.getElementById('rsvp-submit-btn');
        if (submitBtn) submitBtn.textContent = 'Submit RSVP & Pay';
        var monzoNote = document.getElementById('rsvp-monzo-note');
        if (monzoNote) monzoNote.classList.remove('hidden');
        var ratePerNight = parseFloat(guestData.cost);
        document.querySelectorAll('.accom-night-check').forEach(function(cb) {
          cb.addEventListener('change', function() {
            var checked = document.querySelectorAll('.accom-night-check:checked');
            var total = checked.length * ratePerNight;
            var totalLine = document.getElementById('accom-total-line');
            var display = document.getElementById('accom-cost-display');
            if (display) display.textContent = '£' + total.toFixed(2);
            if (totalLine) totalLine.classList.toggle('hidden', checked.length === 0);
          });
        });
      }

      window.dispatchEvent(new Event('guestDataReady'));
      if (typeof window.updateAccomSection === 'function') window.updateAccomSection();
      // Expose for accommodation page
      window.INVITE_CODES = { onsite: 'onsite', offsite: 'offsite' };
    }

    // Personalise welcome heading on home page
    var data = guestData || JSON.parse(sessionStorage.getItem('guestData') || '{}');
    var welcomeEl = document.getElementById('welcome-heading');
    if (welcomeEl && data.guestName) {
        welcomeEl.textContent = 'Hi ' + data.guestName + '!';
    }

    // If on accommodation page, trigger its display
    if (typeof window.showAccommodation === 'function' && data.type) {
      window.showAccommodation(data.type);
    }
  }

  function validateCode(code, callback) {
    var trimmed = code.trim();
    if (!trimmed) { callback(false); return; }

    $.ajax({
      url: VALIDATE_URL + '?code=' + encodeURIComponent(trimmed),
      method: 'GET',
      dataType: 'json'
    })
    .done(function(response) {
      if (response.valid) {
        var guestData = {
          code: trimmed,
          guestName: response.guestName,
          type: response.type,  // 'onsite' or 'offsite'
          cost: response.cost   // cost per night for onsite guests
        };
        sessionStorage.setItem('inviteCode', trimmed);
        sessionStorage.setItem('guestData', JSON.stringify(guestData));
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
          window.location.href = 'index.html';
        } else {
          showSite(trimmed, guestData);
          callback(true);
        }
      } else {
        callback(false);
      }
    })
    .fail(function() {
      callback(false);
    });
  }

  // Check for existing session
  var saved = sessionStorage.getItem('inviteCode');
  var savedData = sessionStorage.getItem('guestData');
  if (saved && savedData) {
    try {
      var data = JSON.parse(savedData);
      showSite(saved, data);
    } catch(e) {
      // Invalid stored data, show overlay
      sessionStorage.removeItem('inviteCode');
      sessionStorage.removeItem('guestData');
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  } else {
    // Show overlay
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  overlayBtn.addEventListener('click', function() {
    overlayError.classList.add('hidden');
    overlayBtn.disabled = true;
    overlayBtn.textContent = 'Checking...';
    validateCode(overlayInput.value, function(valid) {
      overlayBtn.disabled = false;
      overlayBtn.textContent = 'Enter';
      if (!valid) {
        overlayError.classList.remove('hidden');
      }
    });
  });

  overlayInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') overlayBtn.click();
  });

  badgeLogout.addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.removeItem('inviteCode');
    sessionStorage.removeItem('guestData');
    overlay.classList.remove('hidden');
    badge.classList.add('hidden');
    overlayInput.value = '';
    overlayError.classList.add('hidden');
    document.body.style.overflow = 'hidden';
    overlayInput.focus();
    // If on accommodation page, reset its display
    if (typeof window.resetAccommodation === 'function') {
      window.resetAccommodation();
    }
  });
})();