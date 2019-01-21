var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var API = require('./gapRule');

var jsonPath = path.join(__dirname, 'test-case.json');
var jsonString = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const reservations = jsonString.reservations;
const campsites = jsonString.campsites;
let newMap = API.createAvailabilityMap(new Map(), reservations);

describe('campspot test suite', function () {
    it('should have a test', function () {
        expect(true).to.equal(true)
    });
    it('should return an array of campsites with no reservations', function () {
        expect(API.hasNoReservations(campsites, reservations)).to.deep.equal([{
            "id": 5,
            "name": "Cabin in the Woods"
        }])
    });
    it('should return false if start gap is equal to not allowed gap days', function () {
        expect(API.checkBooking(1, 0, 1)).to.equal(false);
    });
    it('should return false if end gap is equal to not allowed gap days', function () {
        expect(API.checkBooking(0, 1, 1)).to.equal(false);
    });
    it('should return false if both start gap and end gap are equal to not allowed gap days', function () {
        expect(API.checkBooking(1, 1, 1)).to.equal(false);
    });
    it('availabilityMap should have keys 1, 2, 3', function () {
        expect(newMap).to.have.all.keys(1, 2, 3);
    });
    it('should have a openStart and openDate values in availabilityMap', function () {
        expect(newMap.get(1)).to.have.all.keys(['openStart', 'openEnd']);
    });
    it('should return difference in days between two dates', function () {
        expect(API.findGap('2018-06-04', '2018-06-01')).to.equal(3);
    })
    it('should return the campsite by id', function () {
        expect(API.findCampsite(2, campsites)).to.deep.equal({
            "id": 2,
            "name": "Comfy Cabin"
        });
    });
    it('should return an array of reservations for campsite by id', function () {
        expect(API.findReservations(2, reservations)).to.deep.equal([{ campsiteId: 2, startDate: '2018-06-01', endDate: '2018-06-01' },
        { campsiteId: 2, startDate: '2018-06-02', endDate: '2018-06-03' },
        { campsiteId: 2, startDate: '2018-06-07', endDate: '2018-06-09' }])
    })
    it('should sort an array of objects by id', function () {
        expect(API.sortArrayOfObjectsById(
            [{
                "id": 2,
                "name": "Comfy Cabin"
            },
            {
                "id": 1,
                "name": "Cozy Cabin"
            },
            {
                "id": 3,
                "name": "Rustic Cabin"
            }])).to.deep.equal([{
                "id": 1,
                "name": "Cozy Cabin"
            },
            {
                "id": 2,
                "name": "Comfy Cabin"
            },
            {
                "id": 3,
                "name": "Rustic Cabin"
            }])
    });
    it('should store campsites with only one reservation in an array', function () {
        expect(API.storeCampsitesWithOneRes([], newMap, reservations)).to.deep.equal([
            {
                "campsiteId": 4,
                "startDate": "2018-06-08",
                "endDate": "2018-06-10"
            }
        ])
    })
    it('should return names of cabins available for booking', function () {
        expect(API.GapRule(jsonString, 1)).to.deep.equal(['Comfy Cabin', 'Rickety Cabin', 'Cabin in the Woods'])
    })
})
