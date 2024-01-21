# SR Booster

This small application was created to simulate ranked matches in the game [SpeedRunners](https://store.steampowered.com/app/207140/SpeedRunners/) in order to gain points.

The application is meant to be ran on a Raspberry Pi.

# Requirements

-   two steam accounts that have SpeedRunners
-   a way to catch outgoing HTTP requests, like [Wireshark](https://www.wireshark.org/) or [Fiddler](https://www.telerik.com/download/fiddler)
-   a JavaScript runtime like [Node](https://nodejs.org/en)

# Instructions

1. open the [index.js](./index.js) file at the top where you can find the configuration variables
2. get the [steam3ID's](https://steamrep.com/) (the number after the second `:`) of both accounts and place them in `p1id` and `p2id` (player 1 is the player who will win the matches)
3. launch your preffered network analyzer app
4. launch SpeedRunners
5. from any request that sends your `code` (like `GetRankingDetails`), grab the `code` and place it in `p1code` and `p2code` respectively
6. run `node index.js`
