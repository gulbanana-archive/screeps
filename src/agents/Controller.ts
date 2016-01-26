import Agent from './Agent';
import EnergyLoad from './EnergyLoad';

export default class Controller extends Agent<CreepState>
{    
    private static _registration = Agent.register(Controller);
     
    static get role() { return 'upgrade'; }
    
    act()
    {
        let result = this.creep.upgradeController(this.creep.room.controller); 
        switch (result)
        {
            case ERR_NOT_ENOUGH_RESOURCES:
                this.become(EnergyLoad);
                break;
                
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(this.creep.room.controller);
                break;
                
            case ERR_INVALID_TARGET:
                console.log('upgrade: invalid target ' + this.creep.room.controller)
                break;
                
            case OK:
                if (this.creep.carry.energy == 0) this.become(EnergyLoad);
                break;
                
            default:
                console.log('upgrade: unexpected error ' + result);
        }
    }
}