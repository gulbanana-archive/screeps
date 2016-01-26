import Agent from './Agent';

// fill extensions and spawns with stored energy 
export default class EnergyStore extends Agent<CreepState>
{
    private static _registration = Agent.register(EnergyStore);
     
    static get role() { return 'store'; }
    
    act()
    {
        let spawns = this.creep.room.find<Structure&Energised>(FIND_MY_SPAWNS);
        let extensions = this.creep.room.find<Structure&Energised>(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }});
        let storage = spawns.concat(extensions).filter(s => s.energy < s.energyCapacity);
        let target = _.head(storage);
        
        if (!target)
        {
            console.log('store: no empty containers, idling');
            return;
        }
        
        let result = this.creep.transfer(target, RESOURCE_ENERGY);
        switch (result)
        {
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(target);
                break;
                
            case ERR_NOT_ENOUGH_RESOURCES:
                this.unbecome();
                break;
                
            case ERR_FULL:
                console.log('store: target full');
                break;
                
            case ERR_INVALID_TARGET:
                console.log('store: invalid target ' + target);
                break;
                
            case OK:
                if (target.energyCapacity - target.energy >= this.creep.carry.energy) this.unbecome();
                break;
                
            default:
                console.log('store: unexpected error ' + result);
                break;
        } 
    }
}