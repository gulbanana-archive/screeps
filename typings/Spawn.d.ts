/**
 *  Spawns are your colony centers. You can transfer energy into it and create new creeps using createCreep() method. 
 */
interface Spawn
{
    id: string;
    
    room: Room;
    pos: RoomPosition;
}