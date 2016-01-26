import Agent from './Agent';
import EnergyLoad from './EnergyLoad';

interface BuilderState extends CreepState
{
    buildSite?: string;
}

export default class Builder extends Agent<BuilderState>
{           
    private static _registration = Agent.register(Builder);
     
    static get role() { return 'build'; }
     
    act()
    {
        if (!this.state.buildSite)
        {
            let site = this.creep.pos.findClosestByPath<ConstructionSite>(FIND_CONSTRUCTION_SITES);
            if (site)
            {
                this.state.buildSite  = site.id;
            }
            else
            {
                console.log('build: no construction sites found');
            }
        }
        
        let site = Game.getObjectById(this.state.buildSite) as ConstructionSite;    
        
        let result = this.creep.build(site); 
        switch (result)
        {                
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(site);
                break;
                
            case ERR_NOT_ENOUGH_RESOURCES:
                this.become(EnergyLoad);
                break;
                
            case ERR_INVALID_TARGET:
                if (site != null) console.log('build: invalid target ' + site);
                this.state.buildSite = null;
                break;
                
            case ERR_BUSY:
                console.log('build: still being spawned');
                break;
                
            case OK:
                if (this.creep.carry.energy == 0) this.become(EnergyLoad);
                break;
                
            default:
                console.log('build: unexpected error ' + result);
        }
    }
};