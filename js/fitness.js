;(function($) {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonthName();
    var activity_base_url = "http://runkeeper.com/user/colmjude/activity/";
    $.getJSON("data/fitness.json", function(data) {
        // populate current month first
        populateMonth(data[0][year][month]);
        // remove current month so isn't populated again
        delete data[0][year][month];
        // iterate through current year
        for (var m in data[0][year]) {
            populateMonth(data[0][year][m]);
        }
        //for(var i = 0; i < data[0][year].length)
    });

    function populateMonth(month_data) {
        for( var i = 0; i < month_data.length; i++) {
            var $day = $('*[data-date="'+month_data[i]['date']+'"]', '.thismonth');
            $day
                .addClass("activity")
                .addClass(month_data[i]['type']);
            if(month_data[i]['activity_id']) {
                $day.append( $("<a></a>", {"href": activity_base_url+month_data[i]['activity_id']}));
            }
        }
    }
}(jQuery));