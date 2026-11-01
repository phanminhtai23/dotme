# Game catalog

Admin can choose one of the games below when creating a link. Existing links
without a `gameId` keep the game previously associated with their page type.

| Game | Default page type |
| --- | --- |
| Balloon Pop | Birthday |
| Cat Runner | Motivation |
| Heart Memory | Love |
| Goose Forage | Any page type |
| Snake | Any page type |
| Star Catcher | Any page type |

The Snake option was selected after reviewing
[TomMalbran/games](https://github.com/TomMalbran/games), an MIT-licensed
collection that includes Snake, Bounce, Defender, Pacman, Puzzle, and Spider.
The app's Snake game is implemented as a native React component; no upstream
source or assets are bundled.

All games fit narrow mobile screens and provide touch interaction. Cat Runner
supports tapping to jump and a press-and-hold crouch control on touch devices.

Goose Forage is an original grid game with a hand-drawn baby goose. Guide it
around the garden to collect seeds; movement is controlled by the arrow keys,
WASD, or on-screen buttons. Each difficulty has a countdown timer; collect the
target number of seeds before time runs out.

Star Catcher is an original canvas game. Move the basket with the arrow keys,
A/D, on-screen controls, or by dragging on touch screens to catch falling stars.

Each started round reserves one of the link's three default attempts. Admins
can grant additional attempts from the link list; retries go through the same
server-side reservation, and in-game restart buttons are intentionally omitted
so they cannot bypass the limit.

Admins can also add an optional personal note of up to 500 characters when
creating a link. The note is displayed as plain text on the Motivation,
Birthday, and Love pages.
