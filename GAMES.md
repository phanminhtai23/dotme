# Game catalog

Admin can choose one of the games below when creating a link. Existing links
without a `gameId` keep the game previously associated with their page type.

| Game | Default page type |
| --- | --- |
| Balloon Pop | Birthday |
| Cat Runner | Motivation |
| Heart Memory | Love |
| Snake | Any page type |

The Snake option was selected after reviewing
[TomMalbran/games](https://github.com/TomMalbran/games), an MIT-licensed
collection that includes Snake, Bounce, Defender, Pacman, Puzzle, and Spider.
The app's Snake game is implemented as a native React component; no upstream
source or assets are bundled.

Each started round reserves one of the link's three attempts. Retries go
through the same server-side reservation, and in-game restart buttons are
intentionally omitted so they cannot bypass the limit.
