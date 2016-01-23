/**
 * Creeps are your units. Creeps can move, harvest energy, construct structures, attack another creeps, and perform other actions.
 */
interface Creep
{
    room: Room;
    
    /**
     * Harvest energy from the source. Needs the WORK body part. If the creep has an empty CARRY body part, the harvested energy is put into it; otherwise it is dropped on the ground. The target has to be at an adjacent square to the creep.
     */
    harvest(target: Source): number;
    
    /**
     * Find the optimal path to the target within the same room and move to it. A shorthand to consequent calls of pos.findPathTo() and move() methods. If the target is in another room, then the corresponding exit will be used as a target. Needs the MOVE body part.
     */
    moveTo(target: RoomPosition|{pos: RoomPosition}): number;
}