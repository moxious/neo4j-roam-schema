// Wrap/hide the complexity of whether to choose the web neo4j driver
// or the regular one.
const neo4j = require('neo4j-driver');
const _ = require('lodash');

// As of Neo4j driver 1.7, no longer     need to separately import
// the minified web driver.
// let driverObj;
// driverObj = neo4j.v1;

// Admittedly a bit nasty, this code detects whether what we're looking at is really a neo4j driver
// int object, which is a special object designed to overcome the range differences between Neo4j numbers
// and what JS can support.
const isNeo4jInt = o =>
    o && _.isObject(o) && !_.isNil(o.high) && !_.isNil(o.low) && _.keys(o).length === 2;

const handleNeo4jInt = val => {
    if (!isNeo4jInt(val)) { return val; }
    return neo4j.integer.inSafeRange(val) ? val.toNumber() : neo4j.integer.toString(val);
};

const getValueFromRecord = (record, toExtract, required=false, defaultValue=null) => {
    /**
     * toExtract may either be a string "fooField" or a row object with an accessor, like:
     * { Header: "Whatever", accessor: 'fooField', absentValue: [] }
     */
    let field;
    if (typeof toExtract === 'string') {
        field = toExtract;
    } else {
        field = toExtract.accessor;
    }

    if (!field) {
        throw new Error(`Cannot determine which field to extract from record given ${JSON.stringify(toExtract)}`);
    }

    const dotted = field.indexOf('.') > -1;
    const resultField = dotted ? field.substring(0, field.indexOf('.')) : field;
    const restPath = dotted ? field.substring(field.indexOf('.') + 1) : null;

    try {
        const value = record.get(resultField);

        if (restPath) {
            return _.get(value, restPath);
        }

        return value;
    } catch (e) {
        if (required) { throw e; }

        // If the record specifies an absentValue, return that, otherwise
        // the default
        return _.get(toExtract, 'absentValue') || defaultValue;
    }
};

/**
 * Converts a Neo4j result set into an array of vanilla javascript objects.
 * Converts all numbers to either a number (if in range) or a string on a best effort
 * basis.  Permits the use of dot notation, so that you can extract a sub-field of
 * a map.
 * 
 * If a property is optional and it's missing, you will get null back.  If a property
 * is required and it's missing, you get an error thrown.
 * 
 * #operability this arose from a lot of boilerplate code I had been writing with the JS
 * driver.  Issues:  
 * - record.get() throws an error and doesn't let you specify a default if it's missing
 * - You have to do number handling on your own, every time.
 * 
 * @param {*} results the results object
 * @param {Object} schema consisting of two keys, required and optional.  Each of those
 * is an array of property names.
 * @returns {Array} of Objects
 */
const unpackResults = (results, schema) => results.records.map((record, index) => {
    const unpacked = { index };

    if (!schema || (!schema.required && !schema.optional)) {
        throw new Error('Unpack results was passed an invalid schema');
    }

    (schema.required || []).forEach(requiredField => {
        // Throws error if missing
        const value = getValueFromRecord(record, requiredField, true);
        unpacked[requiredField] = isNeo4jInt(value) ? handleNeo4jInt(value) : value;
    });

    (schema.optional || []).forEach(optionalField => {
        const value = getValueFromRecord(record, optionalField, false);
        unpacked[optionalField] = isNeo4jInt(value) ? handleNeo4jInt(value) : value;
    });

    return unpacked;
});

neo4j.unpackResults = unpackResults;
neo4j.isNeo4jInt = isNeo4jInt;
neo4j.handleNeo4jInt = handleNeo4jInt;
neo4j.SYSTEM_DB = 'system';

export default neo4j;
