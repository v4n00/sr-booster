# SR Booster

This small application was created to simulate ranked matches in the game [SpeedRunners](https://store.steampowered.com/app/207140/SpeedRunners/) in order to gain points automatically.

The application is meant to be ran on a Raspberry Pi.

## Requirements

- two (or more) steam accounts that have SpeedRunners
- a way to catch outgoing HTTP requests, like [Wireshark](https://www.wireshark.org/) or [Fiddler](https://www.telerik.com/download/fiddler) (recommended)
- a JavaScript runtime like [Node](https://nodejs.org/en)

## Instructions

1. open the [index.js](./index.js) file at the top where you can find the configuration variables
2. get the [steam3ID's](https://steamrep.com/) (the number after the second `:`) of the accounts and place them in `playerIds` array (first player is favored to win, based on `playerWinProbability` variable)
3. launch your preffered network analyzer app
4. launch SpeedRunners
5. from any request that sends your `code` (like `GetRankingDetails`), grab the `code` and place it in `playerTickets` array, make sure the order matches the `playerIds` array
6. run `node index.js`
