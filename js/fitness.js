;(function($) {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonthName();
    var activity_base_url = "http://runkeeper.com/user/colmjude/activity/";
    $.getJSON("data/fitness.json", function(data) {
        var current_month = data[0][year][month];
        for( var i = 0; i < current_month.length; i++) {
            var $day = $('*[data-date="'+current_month[i]['date']+'"]', '.thismonth');
            $day
                .addClass("activity")
                .addClass(current_month[i]['type']);
            if(current_month[i]['activity_id']) {
                $day.append( $("<a></a>", {"href": activity_base_url+current_month[i]['activity_id']}));
            }
        }
    });
}(jQuery));