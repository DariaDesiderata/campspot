var fs = require('fs');
var path = require('path');
var moment = require('moment');

var jsonPath = path.join(__dirname, 'test-case.json');
var jsonString = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));



const searchRange = jsonString.search;
const reservations = jsonString.reservations;
const campsites = jsonString.campsites;
const allowGapDays = 1;
let availableCabins = [];

const searchStartDate = moment(searchRange.startDate);
const searchEndDate = moment(searchRange.endDate);

let cabinsWithNoRes = hasNoReservations(campsites);
let availabilityMap = new Map();
let openArr = [];
let startGap = null;
let endGap = null;


if (cabinsWithNoRes.length) {
    cabinsWithNoRes.forEach(function (cabin) {
        availableCabins.push(cabin);
    });
}

for (let i = 0; i < reservations.length - 1; i++) {
    if (reservations[i].campsiteId === reservations[i + 1].campsiteId) {
        let gap = findGap(moment(reservations[i + 1].startDate), moment(reservations[i].endDate))
        if (gap > 0) {
            availabilityMap.set(
                reservations[i].campsiteId,
                {
                    openStart: moment(reservations[i].endDate).add(1, 'day'),
                    openEnd: moment(reservations[i + 1].startDate).subtract(1, 'day')
                })
        };
    };
}
openArr.push(reservations.find(function (res) {
    return !availabilityMap.has(res.campsiteId);
}))
openArr.forEach(function (res) {
    endGap = 0;
    startGap = 0;
    if (moment(searchStartDate).isBefore(moment(res.startDate))) {
        // if the search starts before current res
        // make sure that the res ends before the start of next res 
        // and the diff is less than or equals gapdays
        endGap = findGap(res.startDate, searchEndDate);

    } else {
        // if the search starts after current res
        // make sure the gap between lastRes.endDate and nextRes startDate
        // is more than gapdays and not negative
        startGap = findGap(res.endDate, searchStartDate);
    }
    checkBooking(startGap, endGap) && availableCabins.push(findCampsite(res.campsiteId));
})

availabilityMap.forEach(function (value, key) {
    startGap = findGap(value.openStart, searchStartDate);
    endGap = findGap(value.openEnd, searchEndDate);
    checkBooking(startGap, endGap) && availableCabins.push(findCampsite(key));
})

function checkBooking(startGap, endGap) {
    let invalidStartDate = startGap === allowGapDays || startGap > 0;
    let invalidEndDate = endGap === allowGapDays || endGap < 0;
    let validStartDate = startGap === 0 || startGap > allowGapDays;
    let validaEndDate = endGap === 0 || endGap > allowGapDays;
    if (invalidStartDate || invalidEndDate) {
        return false;
    }
    if (validStartDate && validaEndDate) {
        return true;
    }
}
function findGap(date1, date2) {
    return moment(date1).diff(moment(date2), 'days');
}
function findCampsite(id) {
    return campsites.find(function (campsite) {
        return campsite.id === id;
    })
}
function findReservations(id) {
    return reservations.find(function (res) {
        return res.campsiteId === id;
    })
}
function hasNoReservations(arrOfCamps) {
    return arrOfCamps.filter(function (camp) {
        return !findReservations(camp.id);
    })
}
availableCabins.sort(function (a, b) {
    return a.id > b.id;
})
availableCabins.forEach(function (cabin) {
    process.stdout.write(cabin.name + '\n');
})