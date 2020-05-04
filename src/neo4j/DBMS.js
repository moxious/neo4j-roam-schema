import neo4j from './driver';
import _ from 'lodash';

export default class DBMS {
    constructor(settings) {
        this.settings = settings;

        const required = ['uri', 'user', 'password'];
        required.forEach(setting => {
            const val = _.get(this.settings, setting);
            if (!val) {
                throw new Error(`Missing required setting: ${setting}`);
            }
        });
    }

    getDriver() {
        if (this.driver) {
            return this.driver;
        }

        this.driver = neo4j.driver(this.settings.uri, neo4j.auth.basic(this.settings.user, this.settings.password));
        return this.driver;
    }

    shutdown() {
        if (this.driver) { return this.driver.close(); }
    }

    session() {
        return this.getDriver().session();
    }
};