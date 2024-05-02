# SR Booster

This small application was created to simulate ranked matches in the game [SpeedRunners](https://store.steampowered.com/app/207140/SpeedRunners/) in order to gain points automatically.

## Requirements

- two (or more) steam accounts that have SpeedRunners
- a way to catch outgoing HTTP requests, like [Wireshark](https://www.wireshark.org/) or [Fiddler](https://www.telerik.com/download/fiddler) (recommended)
- a JavaScript runtime like [Node](https://nodejs.org/en)

## Instructions

1. run `npm i` command in the root directory
2. open the [index.js](./index.js) file at the top where you can find the configuration variables
3. get the [Steam3ID's](https://steamid.uk/) (example: `U:1:1111111`, you need the number after the second `:`) of the accounts and place them in `playerIds` array (first player is favored to win)
4. launch your preffered network analyzer app
5. launch SpeedRunners
6. from any request that sends your `code` (like `GetRankingDetails`), grab the `code` and place it in `playerTickets` array, make sure the order matches the `playerIds` array
7. run `node index.js`

## Additional configuration variables

- `playerWinProbability` - probability of the first player winning the match
- `checkInCooldownAverage` - how long a game lasts
- `checkOutCooldownAverage` - how long until the next game starts

## Errors

- sometimes, the tickets expire and you get a `401` error when checking in, if that happens, grab the tickets again
- if you generate a new ticket, the previous tickets are invalidated, so make sure you don't relaunch the game
- unused tickets stay valid for ~5 minutes
- used tickets stay valid for ~24 hours
