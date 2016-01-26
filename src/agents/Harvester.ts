import Agent from './Agent';
import Controller from './Controller';
import EnergyStore from './EnergyStore';

interface HarvesterState extends CreepState
{
    harvestSource?: string;
}

export default class Harvester extends Agent<HarvesterState>
{    
    private static _registration = Agent.register(Harvester);
     
    static get role() { return 'harvest'; }
    
    act()
    {
        if (!this.state.harvestSource)
        {
            let newSource = this.creep.pos.findClosestByPath<Source>(FIND_SOURCES);
            if (!newSource)
            {
                console.log("harvest: no path to a source");
                this.reset(Controller);
            }
            else
            {
                this.state.harvestSource = newSource.id;
            }
        }
        
        let source = Game.getObjectById(this.state.harvestSource) as Source;
        
        let result = this.creep.harvest(source);
        switch (result) 
        {
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(source);
                break;
                
            case ERR_INVALID_TARGET:
                console.log('harvest: source invalid. searching...');
                this.state.harvestSource = null;
                break;
                
            case ERR_BUSY:
                console.log('harvest: still being spawned');
                break;
            
            case ERR_NOT_ENOUGH_RESOURCES:
                if (this.creep.carry.energy > 0) this.reset(Controller);
                break;
            
            case OK:
                if (this.creep.carry.energy == this.creep.carryCapacity) this.become(EnergyStore);
                break;
            
            default:
                console.log('harvest: unexpected error ' + result);
        }
    }
}