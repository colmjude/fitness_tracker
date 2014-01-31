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

// mps = months either side
function generateCalendar(months) {
    var ms = months || 1;
    var now = new Date(),
        current_month = now.getMonth(),
        current_year = now.getFullYear();
    var markup = "";
    var i = 0 - ms;
    while (i <= ms) {
        var m = calculateMonth({month: current_month, year: current_year}, i);
        markup += generateMonthMarkup(getMonthDetails(m.month, m.year));
        i++;
    }
    return markup;
}

function getMonthDetails(month, year) {
    var m = {};
    // handle if month is passed as name e.g. January or num e.g. 0
    if( isString(month) ) {
        m.name = month;
        m.num = Date.getMonthNumberFromName(month);
    } else {
        m.name = new Date(year, month, 1).getMonthName();
        m.num = month;
    }
    m.no_days = Date.getDaysInMonth(year, m.num);
    m.firstday = new Date(year, m.num, 1).getDay();
    m.lastday = new Date(year, m.num, m.no_days).getDay();
    m.year = year;
    return m;
}

function calculateMonth(obj, diff) {
    // default to -1 if not set
    var diff = (diff === undefined) ? -1 : diff;
    var m_diff = diff % 12;
    var orig_m = obj.month;
    // if: below 0, in calendar 0 equivalent to 12
    // else if: above 11, as about 12 eqivalent to 0
    // else: not crossing year range
    if(obj.month + m_diff < 0) {
        obj.month = 12 + (obj.month + m_diff);
    } else if(obj.month + m_diff > 11) {
        obj.month = 0 + (obj.month + m_diff) - 12;
    } else {
        obj.month = obj.month + m_diff;
    }
    obj.year = obj.year + Math.floor((diff + orig_m)/12);
    return obj;
}

Date.prototype.getWeekday = function() {
    return weekdays[this.getDay()];
}

Date.prototype.getWeekdayInitial = function() {
    return this.getWeekday().charAt(0);
}

function generateMonthMarkup(month) {
    // probably need to sort this to handle a given date
    var markup = '<h1>'+ month.name + ' ' + month.year +'</h1>\n';
    markup += weekdays_markup;
    markup += '<section class="calendar cf">\n';
    markup += generateEndOfLastMonth(month.firstday, month.num, month.year);
    markup += generateMonthList(month.no_days, month.name, month.year);
    markup += generateStartOfNextMonth(month.lastday);
    markup += '</section>\n';
    return markup;
}

function generateEndOfLastMonth(day_num, month_num, year) {
    var lm = calculateMonth({ month: month_num, year: year }, -1);
    var days_last_month = Date.getDaysInMonth(lm.year, lm.month);
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
        var day_init = new Date(year, Date.getMonthNumberFromName(name), i+1).getWeekdayInitial();
        var day = '\t<li data-date="' + date + '" data-day="' + (i+1) + '" data-day-initial="' + day_init + '"></li>\n';
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

var toString = Object.prototype.toString;

function isString(obj) {
  return toString.call(obj) == '[object String]';
}
