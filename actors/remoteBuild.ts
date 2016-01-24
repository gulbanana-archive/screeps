import * as actor from './_actor';

// build in another room
export default function(creep: Creep)
{    
    // if at home, fill up on energy
    let target = creep.memory['remoteDestination'];
    if (creep.room.name != target)
    {
        if (creep.carry.energy < creep.carryCapacity)
        {
            actor.become(creep, 'refill');
            return; 
        }
        
        creep.memory['travelTarget'] = creep.memory['remoteDestination'];
        actor.become(creep, 'travel');
        return;
    }
    
    // work out where to build 
    if (!creep.memory['buildSite'])
    {
        let site = creep.pos.findClosestByPath<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        if (site)
        {
            creep.memory['buildSite']  = site.id;
        }
        else
        {
            console.log('remoteBuild: no construction sites found');
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
            creep.memory['travelTarget'] = creep.memory['remoteOrigin'];
            actor.become(creep, 'travel');
            break;
            
        case ERR_INVALID_TARGET:
            if (site != null) console.log('remoteBuild: invalid target ' + site);
            creep.memory['buildSite'] = null;
            break;
            
        case OK:
            break;
            
        default:
            console.log('remoteBuild: unexpected error ' + result);
    }
};