import Agent from './Agent';

interface TravellerState extends CreepState
{
    travel?: RoomPosition;
}

export default class Traveller extends Agent<TravellerState>
{
    private static _registration = Agent.register(Traveller);
     
    static get role() { return 'travel'; }
    
    act()
    {
        let target = this.state.travel;
        if (!target)
        {
            this.state.travel = null;
            this.unbecome();
            return;
        }
        
        if (this.creep.pos.roomName != target.roomName)
        {    
            let exit = Game.map.findExit(this.creep.pos.roomName, target.roomName);
            switch (exit)
            {
                case ERR_NO_PATH:
                    console.log('travel: exit not found');
                    return;
                
                case ERR_INVALID_ARGS:
                    console.log('travel: premises incorrect');
                    return;
            }
        
            let exitPos = this.creep.pos.findClosestByPath<RoomPosition>(exit);
            this.creep.moveTo(exitPos);
        }
        else if (this.creep.pos.x != target.x || this.creep.pos.y != target.y)
        {
            this.creep.moveTo(target.x, target.y);
        }
        else
        {
            this.state.travel = null;
            this.unbecome();
        }
    }
}