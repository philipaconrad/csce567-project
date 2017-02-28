// Dependencies:
//  - jQuery >= 2.1.1
//  - Materialize >= 0.97.8
//  - Dygraphs >= 2.0.0
//  - Underscore.js >= 1.8.3


// --------------------------------------------------------
// Global Variables
// --------------------------------------------------------

// Place globals here.


// --------------------------------------------------------
// User Interface
// --------------------------------------------------------

// Show/hide settings menu.
function slide_toggle_div(divId) {
    $("#"+divId).slideToggle();
}


// --------------------------------------------------------
// Settings Persistence
// --------------------------------------------------------

// From StackOverflow: http://stackoverflow.com/a/27707708
$(document).ready(function() {
    // The reload settings dance.
    $(window).unload(save_settings);
    load_settings();
});

// Load settings from localStorage.
// Note: Values will be undefined on first-time startup.
function load_settings() {
    $('#fiename').val(localStorage.filename);
}

// Save settings to localStorage.
function save_settings() {
    localStorage.server_url = $('#filename').val();
}

// Waring types:
// - "low-profit"
// - "low-diversity"
// - "high-volatility"
function enable_warning(warn_type) {
	$("#warn-"+warn_type).fadeIn(1000, function() {

	});
}

function disable_warning(warn_type) {
	$("#warn-"+warn_type).fadeOut(1000, function() {

	});
}