import * as _ from 'lodash';

const registry: {[key: string]: typeof Agent} = {};

export default class Agent<T extends CreepState>
{
    creep: Creep;
    
    protected get state()
    {
        return this.creep.memory as T;
    }
    
    constructor(c: Creep)
    {
        this.creep = c;
    }
    
    protected static register(subclass: typeof Agent)
    {
        registry[subclass.role] = subclass;
    }
    
    protected static get role() 
    {
        return '';
    }
    
    protected become(subclass: typeof Agent)
    {
        Agent.become(this.creep, subclass);
    }   
    
    protected unbecome()
    {
        this.creep.memory.age = 0;
        this.creep.memory.act = this.creep.memory.was.pop();
        
        this.act();
    }
    
    protected reset(subclass: typeof Agent)
    {
        Agent.reset(this.creep, subclass);
    }
    
    public act()
    {
        console.log("'" + this.creep.name + "' has undefined role '" + this.creep.memory.act + "'");
    }
    
    public static wrap(c: Creep): Agent<CreepState>
    {
        return new registry[c.memory.act](c);
    } 
    
    public static become(creep: Creep, subclass: typeof Agent)
    {
        if (creep.memory.act == subclass.role) return;
        
        if (_.keys(registry).indexOf(subclass.role) == -1)
        {
            console.log('no such role ' + subclass.role);
            return;
        }
        
        creep.memory.age = 0;
        creep.memory.was.push(creep.memory.act);
        creep.memory.act = subclass.role;
        
        Agent.wrap(creep).act();
    }
    
    public static wasOriginally(roles: string[]): (c: Creep) => boolean
    {
        return function(c: Creep)
        {
            for (let role of roles)
            {
                if ((c.memory.was && c.memory.was.length && c.memory.was[0] == role) || c.memory.act == role) return true;
            } 
            return false;
        }
    }    
    
    public static reset(creep: Creep, subclass: typeof Agent)
    {
        if (creep.memory.act == subclass.role || (creep.memory.was.length && creep.memory.was[0] == subclass.role)) return;
        
        console.log(creep.memory.act + ' "' + creep.name + '" became ' + subclass.role);
        
        creep.memory.age = 0;
        creep.memory.was = [];
        creep.memory.act = subclass.role;
    }
}