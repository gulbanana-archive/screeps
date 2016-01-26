/**
 * A global object representing world map. Use it to navigate between rooms. The object is accessible via Game.map property.
 */
interface GameMap
{
    /**
     * List all exits available from the room with the given name.
     */
    describeExits(roomName: string): {[key: string]: string};
    
    /**
     * Find the exit direction from the given room en route to another room.
     */
    findExit(fromRoom: string, toRoom: string): number;
    
    /**
     * Find route from the given room to another room.
     */
    findRoute(fromRoom: string, toRoom: string): {exit: number, room: string}[];
    
    /**
     * Check if the room with the given name is protected by temporary "newbie" walls.
     */
    isRoomProtected(roomName: string): boolean;
}