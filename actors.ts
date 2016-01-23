import _ = require('lodash');

let actions: {[key: string]: (creep: Creep) => void} = {};

//make progress on the nearest construction site
actions['build'] = function(creep: Creep)
{    
    let site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES) as ConstructionSite;
    
    if (!site)
    {
        console.log('build: no construction site found');
    }
    else
    {
        var result = creep.build(site); 
        switch (result)
        {                
            case ERR_NOT_IN_RANGE:
                creep.moveTo(site);
                break;
                
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.become = 'refill';
                break;
                
            case ERR_INVALID_TARGET:
                console.log('build: invalid target ' + site);
                break;
                
            case ERR_BUSY:
                console.log('build: still being spawned');
                break;
                
            case OK:
                break;
                
            default:
                console.log('build: unexpected error ' + result);
        }
    }
};

//harvest an energy source 
actions['harvest'] = function(creep: Creep)
{
    let source = Game.getObjectById(creep.memory.source) as Source;
    
    if (creep.carry.energy == creep.carryCapacity)
    {
        creep.memory.become = 'store';
        return;
    }
    
    let result = creep.harvest(source);
    switch (result) 
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(source);
            break;
            
        case ERR_INVALID_TARGET:
            console.log('harvest: source invalid. discovering new source...');
            creep.memory.source = creep.pos.findClosestByPath(FIND_SOURCES).id;
            break;
            
        case ERR_BUSY:
            console.log('harvest: still being spawned');
            break;
        
        case OK:
            break;
        
        default:
            console.log('harvest: unexpected error ' + result);
    }
}

//refill stored energy and return to some other action 
actions['refill'] = function(creep: Creep)
{    
    let storage = Game.getObjectById(creep.memory.storage) as Positioned&Energised;
    
    switch (storage.transferEnergy(creep)) 
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(storage);
            break;
            
        case OK:
            creep.memory.become = creep.memory.then;
            break;				
    }
}

//transfer stored energy return to some other action 
actions['store'] = function(creep: Creep)
{    
    let storage = Game.getObjectById(creep.memory.storage) as Creep | Spawn | Structure;
    
    switch (creep.transfer(storage, RESOURCE_ENERGY))
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(storage);
            break;
            
        case OK:
            creep.memory.become = creep.memory.then;
            break;
    } 
}

//upgrade the room control level
actions['upgrade'] = function(creep: Creep)
{    
    switch (creep.upgradeController(creep.room.controller))
    {
        case ERR_NOT_ENOUGH_RESOURCES:
            creep.memory.become = 'refill';
            break;
            
        case ERR_NOT_IN_RANGE:
            creep.moveTo(creep.room.controller);
            break;
    }
}

export default actions;