### Gap rule implementation

This program is intended to prevent new reservations from creating one-night gaps between themselves and existing reservations. It will accomplish this by looking at the existing reservations and the dates we are booking, and returning only campsite names that can accommodate the new booking without creating gaps. 

It takes a sample JSON input of search date range, existing reservations, a list of campsites, and a gap rule as parameters and creates a list of available spots to book that satisfy the rule. We take into account 3 scenarios - campsites with a map of reservations, campsites with only one reservation, and campsites with open availability. With the given parameters, we first find the gap in the reservation map for each campsite, then compare it with our search dates and make sure that they satisfies the gap rule. 

For the scenario #2, we make sure that if the search start date is before the existing reservation start date, then the search end date does not violate the gap rule; if search start date is after the exsiting reservation start date, we check that the start date does not violate the gap rule with the end of the existing reservation date.

For the last scenario, we assume there are no other restrictions, and mark it as availble.



### To start the project with Docker
1. Install Docker
2. Clone this repo and run `npm docker:build` from CLI
3. `npm docker:run`

### To start the project without Docker
1. Install Node v.10+
2. Clone this repo and run `npm i` and `npm start` from CLI
3. To run tests - run `npm test` from CLI (**note: tests will only execute in Node environment)

