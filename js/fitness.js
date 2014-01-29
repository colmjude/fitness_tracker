;(function($) {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonthName();
    $.getJSON("data/fitness.json", function(data) {
        var current_month = data[0][year][month];
        for( var i = 0; i < current_month.length; i++) {
            $('*[data-date="'+current_month[i]['date']+'"]', '.thismonth')
                .addClass("activity")
                .addClass(current_month[i]['type']);
        }
    });
}(jQuery));