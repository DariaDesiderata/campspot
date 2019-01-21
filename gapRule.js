var fs = require('fs');
var path = require('path');
var moment = require('moment');

var jsonPath = path.join(__dirname, 'test-case.json');
var jsonString = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const notAllowedGaps = 1;

function GapRule(inputJSON, gapRule) {

    const searchRange = inputJSON.search;
    const reservations = inputJSON.reservations;
    const campsites = inputJSON.campsites;
    const searchStartDate = moment(searchRange.startDate);
    const searchEndDate = moment(searchRange.endDate);

    let availableCabins = [];
    let availabilityMap = new Map();
    let openArr = [];
    let startGap = null;
    let endGap = null;

    let cabinsWithNoRes = hasNoReservations(campsites, reservations);

    if (cabinsWithNoRes.length) {
        cabinsWithNoRes.forEach(function (cabin) {
            availableCabins.push(cabin);
        });
    }

    createAvailabilityMap(availabilityMap, reservations);
    storeCampsitesWithOneRes(openArr, availabilityMap, reservations);

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
        checkBooking(startGap, endGap, gapRule) && availableCabins.push(findCampsite(res.campsiteId, campsites));
    })

    availabilityMap.forEach(function (value, key) {
        startGap = findGap(value.openStart, searchStartDate);
        endGap = findGap(value.openEnd, searchEndDate);
        checkBooking(startGap, endGap, gapRule) && availableCabins.push(findCampsite(key, campsites));
    })

    let sortedCabins = sortArrayOfObjectsById(availableCabins);

    sortedCabins.forEach(function (cabin) {
        process.stdout.write(cabin.name + '\n');
    })
    return sortedCabins.map(function (cabin) { return cabin.name; });
}
function checkBooking(startGap, endGap, gapRule) {
    let invalidStartDate = startGap === gapRule || startGap > 0;
    let invalidEndDate = endGap === gapRule || endGap < 0;
    let validStartDate = startGap === 0 || startGap > gapRule;
    let validaEndDate = endGap === 0 || endGap > gapRule;
    if (invalidStartDate || invalidEndDate) {
        return false;
    }
    if (validStartDate && validaEndDate) {
        return true;
    }
}
function createAvailabilityMap(newMap, reservationArray) {
    for (let i = 0; i < reservationArray.length - 1; i++) {
        if (reservationArray[i].campsiteId === reservationArray[i + 1].campsiteId) {
            let gap = findGap(moment(reservationArray[i + 1].startDate), moment(reservationArray[i].endDate))
            if (gap > 0) {
                newMap.set(
                    reservationArray[i].campsiteId,
                    {
                        openStart: moment(reservationArray[i].endDate).add(1, 'day'),
                        openEnd: moment(reservationArray[i + 1].startDate).subtract(1, 'day')
                    })
            };
        };
    }
    return newMap;
}
function findGap(date1, date2) {
    return moment(date1).diff(moment(date2), 'days');
}
function findCampsite(id, arrOfCamps) {
    return arrOfCamps.find(function (campsite) {
        return campsite.id === id;
    });
}
function findReservations(id, reservationArray) {
    return reservationArray.filter(function (res) {
        return res.campsiteId === id;
    });
}
function hasNoReservations(arrOfCamps, reservationArray) {
    return arrOfCamps.filter(function (camp) {
        return !findReservations(camp.id, reservationArray).length;
    });
}
function sortArrayOfObjectsById(arrOfObjects) {
    return arrOfObjects.sort(function (a, b) {
        return a.id > b.id;
    })
}
function storeCampsitesWithOneRes(newArray, map, reservationArray) {
    newArray.push(reservationArray.find(function (res) {
        return !map.has(res.campsiteId);
    }))
    return newArray;
}

module.exports = {
    checkBooking,
    createAvailabilityMap,
    findGap,
    findCampsite,
    findReservations,
    hasNoReservations,
    sortArrayOfObjectsById,
    storeCampsitesWithOneRes,
    GapRule,
}

GapRule(jsonString, notAllowedGaps);