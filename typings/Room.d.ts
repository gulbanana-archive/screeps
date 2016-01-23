interface FindOpts
{
    
}

/**
 * An object representing the room in which your units and structures are in. It can be used to look around, find paths, etc. Every object in the room contains its linked Room instance in the room property.
 */
interface Room
{
    find(type: number, opts?: FindOpts): (Source|ConstructionSite)[];    
}