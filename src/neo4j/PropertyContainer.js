export default class PropertyContainer {
    constructor() {
        this.properties = {};
    }

    getProperty(name) {
        return this.properties[name];
    }

    getProperties() {
        return Object.keys(this.properties);
    }

    mapProperties(f) {
        return Object.values(this.properties).map(f);
    }
}