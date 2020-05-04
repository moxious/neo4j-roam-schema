import PropertyMetadata from './PropertyMetadata';
import _ from 'lodash';
import PropertyContainer from './PropertyContainer';

// This class represents the metadata attached to a distinct set of labels in Neo4j.
export default class LabelSet extends PropertyContainer {
    /**
     * @param {*} rows a set of rows from CALL apoc.meta.nodeTypeProperties()
     */
    constructor(rows) {
        super();
        this.rows = rows;
        this.properties = {};

        this.labels = rows[0].nodeLabels;
        this.nodeType = rows[0].nodeType;

        rows.filter(row => !_.isNil(row.propertyName) && row.propertyName !== 'null').forEach(row => {
            if (!_.isEqual(row.nodeLabels, this.labels)) {
                console.error('Row node labels', row.nodeLabels);
                console.error('This labels', this.labels);
                throw new Error('Inconsistent data provided; all node labels must match');
            }

            const pmd = new PropertyMetadata({
                name: row.propertyName,
                types: row.propertyTypes,
                mandatory: row.mandatory,
                totalObservations: row.totalObservations,
                propertyObservations: row.propertyObservations,
            });

            this.properties[row.propertyName] = pmd;
        }); 
    }

    hasLabel(label) {
        return this.labels.indexOf(label) > -1;
    }
}