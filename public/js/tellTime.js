$(function () {
    $('.smallInfoBar .tellTime').html(new Date().toUTCString());
    var tellTime = setInterval(function () {
        $('.smallInfoBar .tellTime').html(new Date().toUTCString());
    }, 1000);
})
