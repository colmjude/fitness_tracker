require('date-utils');
var fut = require('forEachAsync');
var fs = require('fs');

var weekdays = { "0": "Sunday", "1": "Monday", "2": "Tuesday", "3": "Wednesday", "4": "Thursday", "5": "Friday", "6": "Saturday" },
    weekdays_markup = ['<ol class="weekdays cf">\n',
'    <li>S</li>',
'    <li>M</li>',
'    <li>T</li>',
'    <li>W</li>',
'    <li>T</li>',
'    <li>F</li>',
'    <li>S</li>',
'</ol>'].join('\n');

var startdate = "January";

// console.log("year: ", current_year);
// console.log("month #: ", month_num);
// console.log("# of days in current month: ", days_in_c_month);
// console.log("month started on a ", weekdays[day_of_first]);
// console.log("finishes on a ", weekdays[last_of_month]);

function generateCalendar() {
    var now = new Date(),
        current_month = now.getMonthName(),
        current_year = now.getFullYear(),
        month_num = Date.getMonthNumberFromName(current_month),
        days_in_c_month = Date.getDaysInMonth(current_year, month_num);
    var day_of_first = new Date(current_year, month_num, 1).getDay();
    var last_of_month = new Date(current_year, month_num, days_in_c_month).getDay();
    return generateMonthMarkup(current_month, current_year, month_num, days_in_c_month, day_of_first, last_of_month);
}

function generateMonthMarkup(month, year, mnum, no_days, firstday, lastday) {
    // probably need to sort this to handle a given date
    var markup = '<h1>'+ month + ' ' + year +'</h1>\n';
    markup += weekdays_markup;
    markup += '<section class="calendar cf">\n';
    markup += generateEndOfLastMonth(firstday, mnum, year);
    markup += generateMonthList(no_days, month, year);
    markup += generateStartOfNextMonth(lastday);
    markup += '</section>\n';
    return markup;
}

function generateEndOfLastMonth(day_num, month_num, year) {
    var last_month;
    if (month_num === 0) {
        last_month = 11;
        year = year - 1;
    } else {
        last_month = month_num - 1;
    }
    var days_last_month = Date.getDaysInMonth(year, last_month);
    var list = '<ol class="lastmonth">\n';
    for( var i = 0; i < day_num; i++ ) {
        list += '\t<li data-day="' + (days_last_month - (day_num - (i+1))) + '"></li>\n';
    }
    list += '</ol>\n';
    return list;
}

function generateMonthList(num, name, year) {
    var list = '<ol class="thismonth ' + name.toLowerCase() + '">\n';
    for(var i = 0; i < num; i++) {
        var date = generateDateStr(i+1, name, year);
        var day = '\t<li data-date="' + date + '" data-day="' + (i+1) + '"></li>\n';
        list += day;
    }
    list += '</ol>\n';
    return list;
}

function generateStartOfNextMonth(day_num) {
    var list = '<ol class="nextmonth">\n';
    var count = 1;
    for( var i = day_num+1; i < 7; i++ ) {
        list += '\t<li data-day="'+count+'"></li>\n';
        count++;
    }
    list += '</ol>';
    return list;
}

function generateDateStr(num, name, year) {
    var dStr = ("0" + num).slice(-2) + "-" + ("0" + (Date.getMonthNumberFromName(name) + 1)).slice(-2) + "-" + year;
    return dStr;
}

// markup array, join to get page
var htmlQ = [];

fut.forEachAsync(['partials/head.html', generateCalendar, 'partials/footer.html'], function (next, element, index, array) {
  if(isFunction(element)) {
      htmlQ.push( element() );
      next();
  } else {
      addPartialToQueue(element, htmlQ, next);
  }
// then after all of the elements have been handled
// the final callback fires to let you know it's all done
}).then(function () {
  console.log('All requests have finished');
  writeHTMLPage(htmlQ, "fitness.html");
});

function addPartialToQueue(partial, queue, cb) {
    fs.readFile(partial, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      queue.push(data);
      cb();
    });
}

function writeHTMLPage(arr, name) {
    fs.writeFile(name, arr.join('\n'), function (err) {
      if (err) return console.log(err);
      console.log("file written");
    });
}

// from http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}