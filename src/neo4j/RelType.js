import PropertyMetadata from './PropertyMetadata';
import PropertyContainer from './PropertyContainer';
import _ from 'lodash';

// This class represents the metadata attached to a distinct set of labels in Neo4j.
export default class RelType extends PropertyContainer {
    /**
     * @param {*} rows a set of rows from CALL apoc.meta.relTypeProperties()
     */
    constructor(rows) {
        super();
        this.rows = rows;
        this.properties = {};

        this.relType = rows[0].relType;
        this.relTypeName = rows[0].relType.replace(/^:\`/, '').replace(/\`$/, '');
        this.sourceNodeLabels = rows[0].sourceNodeLabels;
        this.targetNodeLabels = rows[0].targetNodeLabels;

        // Filter out null property names which are placeholders for empty property sets.
        rows.filter(row => !_.isNil(row.propertyName) && row.propertyName !== 'null').forEach(row => {
            if (row.relType !== this.relType) {
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
}