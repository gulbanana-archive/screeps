import * as util from '../util';
import Agent from './Agent';
import EnergyLoad from './EnergyLoad';

interface RepairerState extends CreepState
{
    repairTarget?: string;
}

export default class Repairer extends Agent<RepairerState>
{    
    private static _registration = Agent.register(Repairer);
     
    static get role() { return 'repair'; }
    
    act()
    {
        let retarget = this.creep.room.memory.priorityRepairs.pop();
        if (retarget)
        {
            this.state.repairTarget = retarget;
        }
        
        if (this.state.repairTarget)
        {
            let structures = this.creep.room.find<Structure>(FIND_STRUCTURES, {filter: (s: Structure) => s.hits && s.hitsMax});
            let mostDamagedStructure = _.last(_.sortBy(structures, s => util.realMax(s) - s.hits));
            if (mostDamagedStructure) 
            {
                this.state.repairTarget = mostDamagedStructure.id;
            }
            else
            {
                console.log('repair: no damaged structures found');
            }
        }
        
        let target = Game.getObjectById(this.state.repairTarget) as Structure;
        if (!target)
        {
            console.log('repair: no current target, searching...');
            this.state.repairTarget = null;
            return;
        }
        
        let result = this.creep.repair(target); 
        switch (result)
        {                
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(target);
                break;
                
            case ERR_NOT_ENOUGH_RESOURCES:
                this.state.repairTarget = null;
                this.become(EnergyLoad);
                break;
                
            case ERR_INVALID_TARGET:
                console.log('repair: invalid target ' + target);
                break;
                
            case ERR_BUSY:
                console.log('repair: still being spawned');
                break;
                
            case OK:
                if (target.hits == util.realMax(target) || this.creep.carry.energy == 0)
                {
                    this.state.repairTarget = null;
                    this.become(EnergyLoad);
                }
                break;
                
            default:
                console.log('repair: unexpected error ' + result);
        }
    }
}