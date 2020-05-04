import neo4j from '../neo4j/driver';
import _ from 'lodash';
import Promise from 'bluebird';
import LabelSet from './LabelSet';
import RelType from './RelType';
import moment from 'moment';

const nodes = `
    CALL apoc.meta.nodeTypeProperties()
    YIELD nodeType, nodeLabels, propertyName, propertyTypes, mandatory, propertyObservations, totalObservations
    RETURN nodeType, nodeLabels, propertyName, propertyTypes, mandatory, propertyObservations, totalObservations;
`;
const nodesExtract = [
    'nodeType', 'nodeLabels', 'propertyName', 'propertyTypes', 'mandatory', 'propertyObservations', 'totalObservations',
];

const rels = `
    CALL apoc.meta.relTypeProperties()
    YIELD relType, sourceNodeLabels, targetNodeLabels, propertyName, propertyTypes, mandatory, propertyObservations, totalObservations
    RETURN relType, sourceNodeLabels, targetNodeLabels, propertyName, propertyTypes, mandatory, propertyObservations, totalObservations
`;
const relsExtract = [
    'relType', 'sourceNodeLabels', 'targetNodeLabels', 'propertyName', 'propertyTypes', 'mandatory', 'propertyObservations', 'totalObservations',
];

export default class GraphMetadata {
    constructor(dbms, database) {
        this.dbms = dbms;
        this.db = database;
        this.labelSets = [];
        this.relTypes = [];
    }

    getNodesMetadata() {
        const session = this.dbms.getDriver().session({ database: this.db.getName() });

        return session.run(nodes)
            .then(results => neo4j.unpackResults(results, { required: nodesExtract }))
            .then(metadata => {
                this.nodesMetadata = _.groupBy(metadata, 'nodeType');

                this.labelSets = Object.keys(this.nodesMetadata).map(key => new LabelSet(this.nodesMetadata[key]));
                return this.labelSets;
            })
            .finally(() => session.close());
    }

    getRelsMetadata() {
        const session = this.dbms.getDriver().session({ database: this.db.getName() });

        return session.run(rels)
            .then(results => neo4j.unpackResults(results, { required: relsExtract }))
            .then(metadata => {
                // Have to group by all 3 fields, to ensure metadata is consistent, and we don't lump the same rel type spanning
                // different incident node labels together into one metadata field.
                this.relsMetadata = _.groupBy(metadata, i => i.relType + '/' + i.sourceNodeLabels + '/' + i.targetNodeLabels);
                this.relTypes = Object.keys(this.relsMetadata).map(key => new RelType(this.relsMetadata[key]));
                return this.relsMetadata;
            })
            .finally(() => session.close());
    }

    initialize() {
        this.generated = moment.utc();
        
        return Promise.all([this.getNodesMetadata(), this.getRelsMetadata()])
            .catch(err => {
                console.error('ZOMG', err);
            });
    }
}