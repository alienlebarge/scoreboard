# Scoreboard

Your team needs a scoreboard but can't afford the shiny one with LEDs?
No problem, use this one with any browser and project it on any wall using a beamer.

## Features

### Multi-sport Support
- Built-in presets: Football, Hockey, Basketball, Handball
- Custom mode for any other sport
- Configurable number of periods (halves, thirds, quarters, etc.)
- Adjustable duration per period
- Count-down or count-up timer
- Configurable score increments (e.g. +1/+2/+3 for basketball)
- Enable/disable penalties depending on the sport

### Game Setup
- Set custom team names
- Select a sport preset or configure manually
- Start/pause/resume game timer
- Automatic period transitions and end-of-game management

### Score Management
- Dynamic score buttons based on sport configuration
- Add/remove points with configurable increments
- Visual celebration effects when scoring (confetti)
- Real-time score display

### Penalty Management
- Add penalties with player number and duration
- Automatic penalty countdown when game is running
- Remove penalties
- Adjust penalty time
- Multiple simultaneous penalties support
- Penalties can be hidden for sports that don't use them

### Time Management
- Pause/resume game time
- Adjust game time (will proportionally adjust active penalties)
- Automatic switch between periods (supports N periods)
- Count-up or count-down timer
- End of game detection and celebration

### Projection Mode
- Dark theme automatically activates when a game starts
- Maximized scores, timer, and team names for beamer readability
- Configuration panel hidden during the game
- Discrete controls (semi-transparent buttons) to avoid visual clutter
- Reset button available to return to configuration
- Responsive dark mode for mobile devices

### Data Persistence
- All game data is automatically saved
- Game state is restored on page reload
- Backward-compatible localStorage migration
- Option to reset all data and start fresh

## Technical Features
- No installation required
- Works in any modern browser
- Fully responsive design
- Accessible interface with ARIA support
- Offline capable
- Easy to use interface

## Status

This project is under development. There is no stable release yet.

## Usage

1. Open the scoreboard in your browser
2. Enter team names
3. Select a sport preset or configure the settings manually
4. Start the game
5. Use the interface to:
   - Manage scores
   - Handle penalties (if enabled)
   - Control game time
   - Adjust settings as needed

### Keyboard Shortcuts
- **Spacebar**: Start/pause timer
- **Arrow Left**: Add score to team 1
- **Arrow Right**: Add score to team 2
- **Escape**: Close all open forms

Perfect for:
- Sports clubs
- Amateur leagues
- Training sessions
- Any sport event needing a simple but effective scoreboard
