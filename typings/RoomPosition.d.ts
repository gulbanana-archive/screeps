/**
 * An object representing the specified position in the room. Every object in the room contains RoomPosition as the pos property. The position object of a custom location can be obtained using the Room.getPositionAt() method or using the constructor.  
 */
interface RoomPosition
{
    roomName: string;
    x: number;
    y: number;
    
    /**
     * Find an object with the shortest path from the given position. Uses A* search algorithm and Dijkstra's algorithm.
     */
    findClosestByPath<T>(type: number, opts?: { filter: any }): T;
}