/**
 * A site of a structure which is currently under construction. A construction site can be created using the 'Construct' button at the left of the game field or the Room.createConstructionSite() method. Construction sites are visible to their owners only.
 */
interface ConstructionSite extends Owned, Positioned
{    
    progress: number;
    progressTotal: number;
    structureType: string;
    
    /**
     * Remove the construction site.
     */
    remove(): number;
}