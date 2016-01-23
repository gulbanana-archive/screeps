interface Structure extends Owned, Positioned
{
    hits: number;
    hitsMax: number;
    structureType: string;
    
    /**
     * Destroy this structure immediately.
     */
    destroy(): number;
    
    /**
     * Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.
     */
    notifyWhenAttacked(enabled: boolean): number;
}