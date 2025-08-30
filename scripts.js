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

    $.post('https://script.google.com/macros/s/AKfycbzol9o05jCpTn-PN-_Z2bHi9pDTdRs7bapN3syOh-MHzo3MM1TR_hMETgygC8TCqypH/exec', data)
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