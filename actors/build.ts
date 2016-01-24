import * as actor from './_actor';

// make progress on the nearest construction site
export default function(creep: Creep)
{    
    if (!creep.memory['buildSite'])
    {
        let site = creep.pos.findClosestByPath<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        if (site)
        {
            creep.memory['buildSite']  = site.id;
        }
        else
        {
            console.log('build: no construction sites found');
        }
    }
    
    let site = Game.getObjectById(creep.memory['buildSite']) as ConstructionSite;    
    
    let result = creep.build(site); 
    switch (result)
    {                
        case ERR_NOT_IN_RANGE:
            creep.moveTo(site);
            break;
            
        case ERR_NOT_ENOUGH_RESOURCES:
            actor.become(creep, 'refill');
            break;
            
        case ERR_INVALID_TARGET:
            if (site != null) console.log('build: invalid target ' + site);
            creep.memory['buildSite'] = null;
            break;
            
        case ERR_BUSY:
            console.log('build: still being spawned');
            break;
            
        case OK:
            if (creep.carry.energy == 0) actor.become(creep, 'refill');
            break;
            
        default:
            console.log('build: unexpected error ' + result);
    }
};