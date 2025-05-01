import convert from 'xml-js';

/**
 * Converts XML string to JSON string.
 * @param xmlString The XML string to convert.
 * @returns The JSON string representation or null if conversion fails.
 * @throws Error if XML is invalid.
 */
export function convertToJson(xmlString: string): string | null {
  try {
    const result = convert.xml2json(xmlString, { compact: true, spaces: 4 });
    // Basic validation: Check if it's somewhat JSON-like
    if (result.trim().startsWith('{') || result.trim().startsWith('[')) {
        return result;
    }
    throw new Error("Invalid XML resulted in non-JSON output.");
  } catch (error: any) {
    console.error("XML to JSON conversion error:", error);
    throw new Error(`Invalid XML: ${error.message}`);
  }
}

/**
 * Converts JSON string to XML string.
 * @param jsonString The JSON string to convert.
 * @returns The XML string representation or null if conversion fails.
 * @throws Error if JSON is invalid.
 */
export function convertToXml(jsonString: string): string | null {
  try {
    // Basic validation: Check if it's somewhat JSON-like
     let parsedJson;
    try {
        parsedJson = JSON.parse(jsonString);
    } catch (parseError) {
         throw new Error("Invalid JSON format.");
    }

    const result = convert.json2xml(jsonString, { compact: true, spaces: 4 });
    // Basic validation: Check if it's somewhat XML-like
    if (result.trim().startsWith('<')) {
        return result;
    }
    throw new Error("Invalid JSON resulted in non-XML output.");
  } catch (error: any) {
    console.error("JSON to XML conversion error:", error);
     throw new Error(`Conversion Error: ${error.message}`);
  }
}


/**
 * Generates a basic XSD schema from an XML string.
 * Note: This is a very basic implementation and might not cover all XML complexities.
 * @param xmlString The XML string to convert.
 * @returns The XSD string representation or null if conversion fails or XML is invalid.
 * @throws Error if XML is invalid or structure is unexpected.
 */
export function convertToXsd(xmlString: string): string | null {
  try {
    const jsObject = convert.xml2js(xmlString, { compact: true });

    const generateSchema = (obj: any, elementName: string): string => {
      let schema = `<xs:element name="${elementName}">\n  <xs:complexType>\n    <xs:sequence>\n`;
      let attributesSchema = '';

      if (obj._attributes) {
          attributesSchema += `  <xs:complexType>\n    <xs:simpleContent>\n      <xs:extension base="xs:string">\n`; // Assume string base for simplicity
          for (const attr in obj._attributes) {
              attributesSchema += `        <xs:attribute name="${attr}" type="xs:string" use="optional"/>\n`; // Assume string type and optional
          }
          attributesSchema += `      </xs:extension>\n    </xs:simpleContent>\n  </xs:complexType>\n`;
          // Note: This attribute handling is basic. Mixing attributes and complex content requires different XSD structure.
          // For simplicity here, we'll place attributes outside the sequence if there are child elements.
          // A more robust solution would analyze the structure better.
      }


      let hasChildElements = false;
      for (const key in obj) {
        if (key === '_attributes' || key === '_text' || key === '_cdata') continue;
        hasChildElements = true;
        const child = obj[key];
        const maxOccurs = Array.isArray(child) ? 'unbounded' : '1';

        if (typeof child === 'object' && child !== null && !Array.isArray(child)) {
           // If it's a single object (not an array element)
          if (Object.keys(child).some(k => k !== '_attributes' && k !== '_text' && k !== '_cdata')) {
             // Has nested elements
            schema += generateSchema(child, key);
          } else {
             // Simple element (might have attributes or text)
             schema += `      <xs:element name="${key}" type="xs:string" minOccurs="0" maxOccurs="${maxOccurs}"/>\n`; // Assume string
          }
        } else if (Array.isArray(child)) {
            // If it's an array, process the first element to determine structure
             if (child.length > 0 && typeof child[0] === 'object' && child[0] !== null) {
                 if (Object.keys(child[0]).some(k => k !== '_attributes' && k !== '_text' && k !== '_cdata')) {
                    schema += generateSchema(child[0], key); // Generate schema based on first item
                 } else {
                    schema += `      <xs:element name="${key}" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>\n`;
                 }

             } else {
                 // Array of simple types
                 schema += `      <xs:element name="${key}" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>\n`; // Assume string
             }
        } else {
           // Simple key-value pair (likely from _text or direct value) - Treat as element if not handled elsewhere
           if (key !== '_text' && key !== '_cdata'){ // Avoid duplicating _text if handled separately
            schema += `      <xs:element name="${key}" type="xs:string" minOccurs="0" maxOccurs="1"/>\n`; // Assume string
           }
        }
      }

      schema += `    </xs:sequence>\n`;

      // Add attributes if there were no child elements or handle more complex structure
      if (!hasChildElements && attributesSchema) {
         // If only attributes and potentially text, use simpleContent extension approach (partially formed above)
         // This part needs refinement for correctness based on actual XML structure rules.
         // For this basic version, let's append attributes after sequence if they exist.
         // schema += attributesSchema; // This placement might be incorrect for complex types with attributes.
         // Correct placement should be after sequence if mixing:
         for (const attr in obj._attributes) {
             schema += `    <xs:attribute name="${attr}" type="xs:string" use="optional"/>\n`;
         }

      } else if (hasChildElements && obj._attributes) {
          // If complex type with child elements and attributes
           for (const attr in obj._attributes) {
             schema += `    <xs:attribute name="${attr}" type="xs:string" use="optional"/>\n`;
         }
      }


      schema += `  </xs:complexType>\n</xs:element>\n`;
      return schema;
    };

    const rootElementName = Object.keys(jsObject)[0];
    if (!rootElementName) {
        throw new Error("Could not determine root element.");
    }
    const rootElement = jsObject[rootElementName];

    let finalSchema = `<?xml version="1.0" encoding="UTF-8" ?>\n<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">\n\n`;
    finalSchema += generateSchema(rootElement, rootElementName);
    finalSchema += `</xs:schema>`;

    return finalSchema;

  } catch (error: any) {
    console.error("XML to XSD conversion error:", error);
    throw new Error(`Invalid XML or structure for XSD generation: ${error.message}`);
  }
}
