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
  // Invite code lists — update these with real codes later
  var onsiteCodes  = ['1', '11', '111'];
  var offsiteCodes = ['2', '22', '222'];
  var allCodes = onsiteCodes.concat(offsiteCodes);

  // Expose for accommodation page
  window.INVITE_CODES = { onsite: onsiteCodes, offsite: offsiteCodes };

  var overlay = document.getElementById('invite-overlay');
  var badge   = document.getElementById('invite-badge');
  if (!overlay || !badge) return; // safety check

  var overlayInput = document.getElementById('overlay-invite-input');
  var overlayBtn   = document.getElementById('overlay-invite-btn');
  var overlayError = document.getElementById('overlay-invite-error');
  var badgeCode    = document.getElementById('badge-code');
  var badgeLogout  = document.getElementById('badge-logout');

  function showSite(code) {
    overlay.classList.add('hidden');
    badge.classList.remove('hidden');
    badgeCode.textContent = code;
    document.body.style.overflow = '';
  }

  function validateAndStore(code) {
    var trimmed = code.trim();
    if (allCodes.indexOf(trimmed) !== -1) {
      sessionStorage.setItem('inviteCode', trimmed);
      showSite(trimmed);
      // If on accommodation page, trigger its display
      if (typeof window.showAccommodation === 'function') {
        window.showAccommodation(trimmed);
      }
      return true;
    }
    return false;
  }

  // Check for existing code
  var saved = sessionStorage.getItem('inviteCode');
  if (saved && allCodes.indexOf(saved) !== -1) {
    showSite(saved);
  } else {
    // Show overlay
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  overlayBtn.addEventListener('click', function() {
    overlayError.classList.add('hidden');
    if (!validateAndStore(overlayInput.value)) {
      overlayError.classList.remove('hidden');
    }
  });

  overlayInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') overlayBtn.click();
  });

  badgeLogout.addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.removeItem('inviteCode');
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