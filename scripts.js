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

/********************** Email Updates **********************/
$('#findoutmore-form').on('submit', function (e) {
    e.preventDefault();
    var data = $(this).serialize();

    $('#alert-wrapper').html(alert_markup('info', '<strong>Just a sec!</strong> We are saving your details.'));

    $.post('https://script.google.com/macros/s/AKfycbwD7uqdt9MTCb2fqefu6uRc9_ka4QneKG1G7lQEAYtgPtNRCfT1nGAHDGbQChlzoPQSAg/exec', data)
            .done(function (data) {
                console.log(data);
                if (data.result === "error") {
                    $('#alert-wrapper').html(alert_markup('danger', data.message));
                } else {
                    $('#findoutmore-form')[0].reset(); // Clear the input fields
                    $('#alert-wrapper').html(alert_markup('success', '<strong>Success!</strong> Your details have been saved.'));
                    // Auto-hide the "info" alert after 5 seconds
                    setTimeout(function() {
                        $('#alert-wrapper').find('.p-4').fadeOut('slow');
                    }, 5000);
                }
            })
            .fail(function (data) {
                console.log(data);
                $('#alert-wrapper').html(alert_markup('danger', '<strong>Sorry!</strong> There is some issue with the server. '));
            });
});

/********************** RSVP Multi-Guest Form **********************/
$(document).ready(function() {
    var guestCount = 1;

    // Show/hide dietary + notes based on attending radio (delegated)
    $('#rsvp-form').on('change', 'input[type="radio"]', function() {
        var $card = $(this).closest('.guest-card');
        var val = $card.find('input[type="radio"]:checked').val();
        var $extra = $card.find('.guest-extra-fields');
        if (val === 'Yes') {
            $extra.slideDown(150).removeClass('hidden');
        } else {
            $extra.slideUp(150);
            // Clear dietary selections when hiding
            $card.find('.dietary-options input[type="checkbox"]').prop('checked', false);
            $card.find('.dietary-other-text').val('');
            $card.find('.dietary-error').addClass('hidden');
        }
    });

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
                    '<label class="block font-medium text-[#223c6c] mb-1">Full name</label>' +
                    '<input type="text" name="guest_name" class="find-more-input w-full p-3 rounded border border-gray-300" placeholder="e.g. John Smith" required>' +
                '</div>' +
                '<div class="mb-4">' +
                    '<label class="block font-medium text-[#223c6c] mb-1">Will you be attending?</label>' +
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
                        '<label class="block font-medium text-[#223c6c] mb-1">Any dietary requirements or allergies? <span class="font-normal text-sm">(select at least one)</span></label>' +
                        '<div class="dietary-options flex flex-col gap-2 mt-2">' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="None of the following" class="accent-[#223c6c] mr-2 dietary-none"> None of the following</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Vegan" class="accent-[#223c6c] mr-2 dietary-other-opt"> Vegan</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Nut allergy" class="accent-[#223c6c] mr-2 dietary-other-opt"> Nut allergy</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Gluten free" class="accent-[#223c6c] mr-2 dietary-other-opt"> Gluten free</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Celiac" class="accent-[#223c6c] mr-2 dietary-other-opt"> Celiac</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Soya bean allergy" class="accent-[#223c6c] mr-2 dietary-other-opt"> Soya bean allergy</label>' +
                            '<label class="inline-flex items-center text-[#223c6c]"><input type="checkbox" name="dietary_' + n + '" value="Other" class="accent-[#223c6c] mr-2 dietary-other-opt dietary-other-check"> Other (please specify):</label>' +
                            '<input type="text" name="dietary_other_' + n + '" class="find-more-input w-full p-3 rounded border border-gray-300 ml-6 dietary-other-text" placeholder="Please specify...">' +
                        '</div>' +
                        '<p class="dietary-error text-red-500 text-sm mt-1 hidden">Please select at least one option.</p>' +
                    '</div>' +
                    '<div class="mb-4">' +
                        '<label class="block font-medium text-[#223c6c] mb-1">Anything else we should know?</label>' +
                        '<textarea name="notes_' + n + '" class="find-more-input w-full p-3 rounded border border-gray-300" rows="3" placeholder="Questions, messages of love..."></textarea>' +
                    '</div>' +
                    '<div>' +
                        '<label class="block font-medium text-[#223c6c] mb-1">What is one (or more) songs guaranteed to get you on the dance floor?</label>' +
                        '<textarea name="songs_' + n + '" class="find-more-input w-full p-3 rounded border border-gray-300 song-field" rows="2" placeholder="e.g. Dancing Queen by ABBA"></textarea>' +
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

        // Validate all cards first
        var valid = true;
        $('#guest-cards .guest-card').each(function() {
            var $card = $(this);
            var attending = $card.find('input[type="radio"]:checked').val();
            // Only require dietary if attending
            if (attending === 'Yes') {
                var $checks = $card.find('.dietary-options input[type="checkbox"]:checked');
                var $error = $card.find('.dietary-error');
                if ($checks.length === 0) {
                    $error.removeClass('hidden');
                    valid = false;
                } else {
                    $error.addClass('hidden');
                }
            }
        });
        if (!valid) return;

        // Collect guest data
        var guests = [];
        var timestamp = new Date().toISOString();
        $('#guest-cards .guest-card').each(function() {
            var $card = $(this);
            var name = $card.find('input[name="guest_name"]').val().trim();
            var attending = $card.find('input[type="radio"]:checked').val() || '';

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
            var dietary = dietaryParts.join(', ');

            var notes = $card.find('textarea[name^="notes"]').val().trim();
            var songs = $card.find('textarea[name^="songs"]').val().trim();

            guests.push({
                timestamp: timestamp,
                names: name,
                attending: attending,
                dietary: dietary,
                notes: notes,
                songs: songs
            });
        });

        $('#rsvp-alert-wrapper').html(alert_markup('info', '<strong>Just a sec!</strong> Sending your RSVP...'));

        // Send all guests as JSON
        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbwTe8PSs7fB3BM44_1LutloKVrA0TYdby0fPpLjHTn7J97LPP_0EoOz_eYd2lohPQr7/exec',
            method: 'POST',
            data: JSON.stringify({ guests: guests }),
            contentType: 'text/plain',
            dataType: 'json'
        })
        .done(function(response) {
            console.log(response);
            if (response.result === 'error') {
                $('#rsvp-alert-wrapper').html(alert_markup('danger', response.message));
            } else {
                // Reset: remove extra cards, clear the first one
                $('#guest-cards .guest-card:not(:first)').remove();
                $('#rsvp-form')[0].reset();
                $('#rsvp-alert-wrapper').html(alert_markup('success', '<strong>Thank you!</strong> Your RSVP has been received. We can\'t wait to celebrate with you!'));
                setTimeout(function() {
                    $('#rsvp-alert-wrapper').find('.p-4').fadeOut('slow');
                }, 5000);
            }
        })
        .fail(function(err) {
            console.log(err);
            $('#rsvp-alert-wrapper').html(alert_markup('danger', '<strong>Sorry!</strong> Something went wrong. Please try again or contact us directly.'));
        });
    });
});

// Show/hide nights question based on tent/van selection
$(document).ready(function() {
  // Hide the nights question on page load
  $('#nights-question-row').hide();
  $('input[name="camping"]').on('change', function() {
    if ($('#camping-yes').is(':checked')) {
      $('#nights-question-row').slideDown(150);
    } else {
      $('#nights-question-row').slideUp(150);
      // Uncheck all nights if No is selected
      $('#nights-question-row input[type=checkbox]').prop('checked', false);
    }
  });
});

// Smooth scroll to top button
const scrollToTopBtn = document.getElementById('scrollToTopBtn');
if (scrollToTopBtn) {
  scrollToTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

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
    badgeCode.textContent = code;
    document.body.style.overflow = '';

    // Store guest data for other pages
    if (guestData) {
      sessionStorage.setItem('guestData', JSON.stringify(guestData));
      window.GUEST_DATA = guestData;
      // Expose for accommodation page
      window.INVITE_CODES = { onsite: 'onsite', offsite: 'offsite' };
    }

    // Personalise welcome heading on home page
    var data = guestData || JSON.parse(sessionStorage.getItem('guestData') || '{}');
    var welcomeEl = document.getElementById('welcome-heading');
    if (welcomeEl && data.guestName) {
        welcomeEl.textContent = 'Hey ' + data.guestName + '!';
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
          type: response.type  // 'onsite' or 'offsite'
        };
        sessionStorage.setItem('inviteCode', trimmed);
        sessionStorage.setItem('guestData', JSON.stringify(guestData));
        showSite(trimmed, guestData);
        callback(true);
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