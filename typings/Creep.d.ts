/**
 * Creeps are your units. Creeps can move, harvest energy, construct structures, attack another creeps, and perform other actions.
 */
interface Creep extends Owned, Positioned
{
    carry: { energy: number; power?: number };
    carryCapacity: number;
    fatigue: number;
    hits: number;
    hitsMax: number;
    memory: State;
    name: string;
    spawning: boolean;
    ticksToLive: number;
    
    /**
     * Attack another creep or structure in a short-ranged attack. Needs the ATTACK body part. If the target is inside a rampart, then the rampart is attacked instead. The target has to be at adjacent square to the creep. If the target is a creep with ATTACK body parts and is not inside a rampart, it will automatically hit back at the attacker.
     */
    attack(target: Creep): number;
    
    /**
     * Build a structure at the target construction site using carried energy. Needs WORK and CARRY body parts. The target has to be within 3 squares range of the creep.
     */
    build(target: ConstructionSite): number;
    
    /**
     * Find the optimal path to the target within the same room and move to it. A shorthand to consequent calls of pos.findPathTo() and move() methods. If the target is in another room, then the corresponding exit will be used as a target. Needs the MOVE body part.
     */
    moveTo(target: RoomPosition|{pos: RoomPosition}): number;
    
    /**
     * Harvest energy from the source. Needs the WORK body part. If the creep has an empty CARRY body part, the harvested energy is put into it; otherwise it is dropped on the ground. The target has to be at an adjacent square to the creep.
     */
    harvest(target: Source): number;
    
    /**
     * Kill the creep immediately.
     */
    suicide(): number;

    /**
     * Transfer resource from the creep to another object. The target has to be at adjacent square to the creep.
     */
    transfer(target: Creep | Structure, resourceType: string, amount?: number): number;
    
    /**
     * Upgrade your controller to the next level using carried energy. Upgrading controllers raises your Global Control Level in parallel. Needs WORK and CARRY body parts. The target has to be at adjacent square to the creep. A fully upgraded level 8 controller can't be upgraded with the power over 15 energy units per tick regardless of creeps power. The cumulative effect of all the creeps performing upgradeController in the current tick is taken into account.
     */
    upgradeController(target: Structure): number;
}