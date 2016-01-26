import Agent from './Agent';

export default class Fighter extends Agent<CreepState>
{
    private static _registration = Agent.register(Fighter);
     
    static get role() { return 'fight'; }
    
    act()
    {    
        let enemy: Creep|Spawn|Structure = this.creep.pos.findClosestByRange<Creep>(FIND_HOSTILE_CREEPS);
        if (!enemy) enemy = this.creep.pos.findClosestByRange<Spawn>(FIND_HOSTILE_SPAWNS);
        if (!enemy) enemy = this.creep.pos.findClosestByRange<Structure>(FIND_HOSTILE_STRUCTURES);
        if (enemy)
        {
            let result = this.creep.attack(enemy);
            switch (result)
            {
                case ERR_NOT_IN_RANGE:
                    this.creep.moveTo(enemy);
                    break;
                
                case OK:
                    break;
                    
                default:
                    console.log('fight: unexpected error ' + result);
            }
            return;
        }
        
        let rampart = this.creep.pos.findClosestByRange<Structure>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_RAMPART}});
        if (rampart)
        {
            this.creep.moveTo(rampart);
            return;
        }
    }
}