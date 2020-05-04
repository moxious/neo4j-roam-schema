import _ from 'lodash';
import fs from 'fs';
import path from 'path';

export default class MarkdownExporter {
    /**
     * @param md {GraphMetadata} metadata instance.
     */
    constructor(md, basepath='./schema-docs') {
        this.md = md;
        this.basePath = basepath;
    }

    exportRelType(rt) {
        const file = path.join(this.basePath, `${rt.relTypeName}.md`);
        console.log('Writing ', file);
        const data = relTypeMarkdown(rt);
        fs.writeFileSync(file, data);
    }

    exportLabelSet(ls) {
        const name = ls.labels.join('_');
        const file = path.join(this.basePath, `${name}.md`);
        console.log('Writing', file);
        const data = labelSetMarkdown(ls);
        fs.writeFileSync(file, data);
    }

    exportBasics() {
        // Header, basic schema info, etc.
    }

    export() {
        console.log('Exporting to ', this.basePath);
        fs.mkdirSync(this.basePath, { recursive: true });
        this.exportBasics();
        this.md.labelSets.forEach(ls => this.exportLabelSet(ls));
        this.md.relTypes.forEach(rt => this.exportRelType(rt));
    }
}

const labelLinks = set => set.map(s => `[[${s}]]`).join(', ');

const propertyTypes = (types, indent='   ') =>
    `${indent}- Types: ${types.map(t => `[[${t}]]`).join(', ')}`;

const property = p => 
`- [[${p.name}]]
   - Mandatory: ${p.mandatory}
   - Sample: ${p.propertyObservations}/${p.totalObservations}
${propertyTypes(p.types)}
`;

const propertiesMarkdown = pc => {
    return `
## Properties
${pc.mapProperties(property).join('\n')}
`;
};

const labelSetMarkdown = ls => `
# Label Set: ${labelLinks(ls.labels)}

${propertiesMarkdown(ls)}
`;

const relTypeMarkdown = rt => `
# Relationship: ${rt.relTypeName}

## Incident Labels
- From: ${labelLinks(rt.sourceNodeLabels)}
- To: ${labelLinks(rt.targetNodeLabels)}

${propertiesMarkdown(rt)}
`;