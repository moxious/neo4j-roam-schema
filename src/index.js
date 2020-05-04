import yargs from 'yargs';
import DBMS from './neo4j/DBMS';
import GraphMetadata from './neo4j/GraphMetadata';
import DB from './neo4j/DB';
import MarkdownExporter from './markdown/MarkdownExporter';

const argv = yargs.scriptName('schema generator')
    .usage('$0 [args]')
    .option('a', {
        alias: 'address',
        demandOption: false,
        default: 'bolt://localhost:7687',
        describe: 'Neo4j address to connect to',
        type: 'string',
    })
    .option('u', {
        alias: 'username',
        default: 'neo4j',
        describe: 'Neo4j username',
        type: 'string',
    })
    .option('p', {
        alias: 'password',
        demandOption: true,
        describe: 'User password',
        type: 'string',
    })
    .option('d', {
        alias: 'database',
        demandOption: false,
        describe: 'Database to extract metadata from',
        default: 'neo4j',
        type: 'string',
    })
    .option('o', {
        alias: 'output',
        demandOption: 'false',
        describe: 'Destination directory to write files',
        default: './schema-docs',
        type: 'string',
    })
    .help()
    .argv;

const main = () => {
    const dbms = new DBMS({ 
        uri: argv.a,
        user: argv.u,
        password: argv.p, 
    });
    const db = new DB(argv.d);
    const metadata = new GraphMetadata(dbms, db);

    return metadata.initialize()
        .then(() => {
            console.log(metadata.relTypes);
            console.log(metadata.labelSets);
        })
        .then(() => new MarkdownExporter(metadata, argv.o).export())
        .finally(() => dbms.shutdown());
};

main();
