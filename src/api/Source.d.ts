/**
 * An energy source object. Can be harvested by creeps with a WORK body part.
 */
interface Source extends Positioned, Identified
{
    energy: number;
    energyCapacity: number;
    ticksToRegeneration: number;
}