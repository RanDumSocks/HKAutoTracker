# HKAutoTracker
This is the ugliest code I have ever written, please do not judge me on this monstrosity.
With that being said, this is a auto-tracker for the [Randomiser 4](https://github.com/homothetyhk/RandomizerMod) mod for Hollow Knight.

This project is so bodged, I am using everything exactly how it was not intended to be used, don't hurt me.

![image](https://user-images.githubusercontent.com/23219465/150667011-b843f72b-aa4e-4857-8f0a-495ac35d2f0d.png)
![image](https://user-images.githubusercontent.com/23219465/150667025-71e2ca0a-738b-485b-977d-41ab8a90c0ca.png)

## Special Thanks
[Jamie](https://github.com/ManicJamie) for the [room name dictionary](https://github.com/ManicJamie/HKTranslator/blob/master/TranslatorDictionary.xml)

[asimard](https://github.com/asimard1) for formatting the dictionary and room tagging

## Features
- Full dynamic room mapping as a flow chart
- Shows which rooms have reachable unchecked transitions and item checks
- List of rooms which have unchecked right transitions, useful for finding black egg temple
- Local map view (must have [HKMP](https://github.com/Extremelyd1/HKMP) installed)
	- Shows your current room, and immediate transitions, displaying what door leads to what adjacent room
	- Searches for the nearest unchecked transition and item check and displays the shortest path to get there
	- Shows closest bench to current location, good for telling your friends how to get to your location

## Set-up
1) Download and install dependencies
    - [Obsidian](https://obsidian.md)
    - [Git](https://git-scm.com/download/win)
    - [Node.js](https://nodejs.org/en/)
2) Find a place to put the tracker folder on your computer, right-click and select "Git Bash Here"
3) In the command window, enter the following commands
```bash
git clone https://github.com/RanDumSocks/HKAutoTracker.git
cd HKAutoTracker
node main.js
```
4) Open up Obsidian, and open a new folder as a vault
    - If it doesnt show this window immediately, select the vault icon in the bottom left of the window
5) Select the folder you downloaded in step 3

And boom! Youre done, that window is where all your auto tracking will be, maps and all :)

If you just get text on the screen, click the glasses icon in the top-right of the window.

For path highlighting (highlight paths when you hover your mouse over them, useful when the map gets really complicated, non-euclidian spaces are ugly) go to Settings (cog on lower left of the window) > Appearance >  CSS snippets > enable "hover"

If the hover option doesn't show up, hit the refresh button next to CSS snippets.

## Running

Simply double-click on `run.sh` to start the auto tracking script.

### Manual Running
Whenever you want to run the tracker again:
1) Navigate to the auto-tracker folder, right click inside of it and select "Git Bash Here"
2) In the window, enter in `node main.js`
3) Repeat steps 4 & 5 in Set-Up

## Updating

Simply click on `update.sh` to update the tracker to its latest version.

### Manual Updating
If the tracker is still running (after completing the Running steps), in the command window:

ctrl-c (this stops the tracker)
```bash
git pull
node main.js
```

This updates to whatever is the latest version of the tracker

## Usage
There are currently 3 files which have auto-tracking information, these are visible in the left side-bar in Obsidian

- HKAutotrack
	- This is the main map, optimised for room randos
	- Shows all connections to every room discovered, and updates as you play the game
- localTracker
	- Shows the current room you are in, and immediate screen transitions discovered
	- Find the nearest unchecked screen transition and item check, showing the exact shortest path to get there
- rightLocations
	- Shows all unchecked right facing screen transitions, useful in room rando trying to find black egg temple

### Colours
The map is colour coded, these are what the colours mean:
- Dark-green background
	- current location
- Light-blue background
	- Room with a bench
- Magenta background
	- Stag stations without a bench
- Green text
	- unchecked reachable item check with number of checks in brackets
- Orange boarder
	- unchecked reachable screen transition

## Options
The options file is located in `settings.json`.
Run the program once for it to show up.

| Option Name | Values | Description |
| --- | --- | --- |
 | `translationType` | "full", "basic", "landmark", or "none" | Translates default room ID names with more human readable room names. Basic only changes the names of important locations such as shops and benches, and landmark builds on top of that, adding large room locations with custom names in game, and high transition areas. |
 | `mapOrientation` | "TB", "TD", "BT", "RL", or "LR" | Orientation of the main map. `TB` / `TD` - top to bottom, `BT` -  bottom to top, `RL` -  right to left, `LR` -  left to right. |

## Feedback
This is a horrible and dodgy implementation of an auto-tracker, but it works, quite well!
If you find a bug, or something is broken, please [submit an issue](https://github.com/RanDumSocks/HKAutoTracker/issues/new) and I will attempt to solve all your problems :)
