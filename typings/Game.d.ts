interface Game
{
    creeps: { [key: string]: Creep; };
    spawns: { [key: string]: Spawn; };
    
    /**
     * Send a custom message at your profile email. This way, you can set up notifications to yourself on any occasion within the game. You can schedule up to 20 notifications during one game tick. Not available in the Simulation Room.
     */
    notify(message: string, groupInterval?: number): void;
}