interface Game
{
    map: GameMap;
    creeps: { [key: string]: Creep; };
    spawns: { [key: string]: Spawn; };
    rooms: { [key: string]: Room; };
    
    /**
     * Send a custom message at your profile email. This way, you can set up notifications to yourself on any occasion within the game. You can schedule up to 20 notifications during one game tick. Not available in the Simulation Room.
     */
    notify(message: string, groupInterval?: number): void;
    
    /**
     * Get an object with the specified unique ID. It may be a game object of any type. Only objects from the rooms which are visible to you can be accessed.
     */
    getObjectById(id: string): any;
}