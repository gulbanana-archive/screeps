interface Energised
{    
    energy: number;
    energyCapacity: number;
    
    /**
     * Transfer the energy from this source to a creep.
     */
    transferEnergy(target: Creep, amount?: number): number;
}