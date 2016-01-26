import Agent from './Agent';
import Harvester from './Harvester';

interface LoadState extends CreepState
{
    storage?: string;
}

export default class EnergyLoad extends Agent<LoadState>
{    
    private static _registration = Agent.register(EnergyLoad);
     
    static get role() { return 'refill'; }
    
    act()
    {
        if (!this.state.storage)
        {
            let spawn = _.head(this.creep.room.find<Spawn>(FIND_MY_SPAWNS));

            if (spawn) 
            {
                this.state.storage = spawn.id;
            }
            else
            {
                console.log('refill: no spawn found');
            }
        }
        
        let storage = Game.getObjectById(this.state.storage) as Positioned&Energised;
        if (storage && storage.energy < (this.creep.carryCapacity - this.creep.carry.energy) && this.state.age > 25)
        {
            if (_.sum(_.map(this.creep.room.find<Source>(FIND_SOURCES), s => s.energy)) == 0)
            {
                this.state.age--;
            }
            else
            {
                console.log('refill: waited too long, becoming harvester');
                this.reset(Harvester);
            }
        }

        let result = storage.transferEnergy(this.creep);
        switch (result) 
        {
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(storage);
                break;
                
            case ERR_FULL:
                this.unbecome();
                break;
                
            case ERR_INVALID_TARGET:
                console.log('refill: no storage found, searching...');
                this.state.storage = null;
                break;
                
            case OK:
                // can't transition here since it's too hard to predict whether we're about to get filled up
                break;		
                
            default:
                console.log('refill: unexpected error ' + result);
                break;            
        }
    }    
}