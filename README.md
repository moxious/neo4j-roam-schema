# Neo4j Roam Schema

A small utility for processing Neo4j schemas into Markdown files.  This produces useful Neo4j 
schema documentation on its own, but is also suitable for importing into [Roam](https://roamresearch.com/)

## Setup

```
npm install
npm run build
```

## Generate Markdown Schema

**Note**:  Using this code requires a recent APOC version!

The following command will write docs to the subdirectory
named schema-docs, using the given username and password.

For Neo4j 4.0 databases, the -d flag indicates which database to export metadata for.

```
npm run schema -- \
    -a bolt://localhost:7687 \
    -u neo4j \
    -p admin \
    -d neo4j \
    -o ./schema-docs
```