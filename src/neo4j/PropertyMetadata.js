
export default class PropertyMetadata {
    constructor({ name, types, mandatory, propertyObservations, totalObservations }) {
        this.name = name;
        this.types = types;
        this.mandatory = mandatory;
        this.propertyObservations = propertyObservations;
        this.totalObservations = totalObservations;
    }
};