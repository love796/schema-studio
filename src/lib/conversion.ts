import convert, { Element, ElementCompact } from 'xml-js';

/**
 * Converts XML string to JSON string.
 * @param xmlString The XML string to convert.
 * @returns The JSON string representation or null if conversion fails.
 * @throws Error if XML is invalid.
 */
export function convertToJson(xmlString: string): string | null {
  try {
    // Basic validation: Ensure input is not empty or just whitespace
    if (!xmlString || xmlString.trim().length === 0) {
      throw new Error("Input XML string cannot be empty.");
    }
    const result = convert.xml2json(xmlString, { compact: true, spaces: 4 });
    // Basic validation: Check if it's somewhat JSON-like
    if (result.trim().startsWith('{') || result.trim().startsWith('[')) {
        // Further validation: Try parsing the result to ensure it's valid JSON
        try {
            JSON.parse(result);
            return result;
        } catch (jsonParseError: any) {
             throw new Error(`Conversion resulted in invalid JSON: ${jsonParseError.message}`);
        }
    }
    // If xml2json didn't throw but output isn't JSON-like, it suggests invalid input XML structure
    throw new Error("Invalid XML structure or content.");
  } catch (error: any) {
    console.error("XML to JSON conversion error:", error);
    // Improve error message clarity
    const message = error.message.includes("Text data outside of root node")
      ? "Invalid XML: Text data found outside the root element."
      : error.message.includes("Unexpected close tag")
      ? `Invalid XML: ${error.message}. Check tag matching.`
      : `Invalid XML: ${error.message}`;
    throw new Error(message);
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
    // Basic validation: Ensure input is not empty or just whitespace
    if (!jsonString || jsonString.trim().length === 0) {
        throw new Error("Input JSON string cannot be empty.");
    }
    // Robust validation: Try parsing the JSON first
    let parsedJson;
    try {
        parsedJson = JSON.parse(jsonString);
    } catch (parseError: any) {
         throw new Error(`Invalid JSON format: ${parseError.message}`);
    }

    // Check if the parsed JSON is an object or array (required by xml-js)
     if (typeof parsedJson !== 'object' || parsedJson === null) {
        throw new Error("Invalid JSON: Input must be a JSON object or array.");
     }

    const result = convert.json2xml(jsonString, { compact: true, spaces: 4 });
    // Basic validation: Check if it's somewhat XML-like
    if (result.trim().startsWith('<')) {
        return result;
    }
    // This case should be less likely if JSON parsing succeeded, but good as a fallback
    throw new Error("Conversion failed: Could not generate valid XML from the provided JSON.");
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
    // Assert the type to allow string indexing
    const jsObject = convert.xml2js(xmlString, { compact: true }) as {[key: string]: any};

    // Type assertion for objects being processed by generateSchema
    type IndexableElement = {[key: string]: any};

    const generateSchema = (obj: IndexableElement, elementName: string): string => {
      let schema = `<xsd:element name="${elementName}">\n  <xsd:complexType>\n    <xsd:sequence>\n`;

      const objAttributes = obj._attributes as {[key: string]: string} | undefined;
      const objKeys = Object.keys(obj).filter(k => k !== '_attributes' && k !== '_text' && k !== '_cdata');

      for (const key of objKeys) {
        const child = obj[key];
        const maxOccurs = Array.isArray(child) ? 'unbounded' : '1';

        let childToProcess: IndexableElement | null = null;
        let isComplex = false;

        if (Array.isArray(child)) {
            if (child.length > 0 && typeof child[0] === 'object' && child[0] !== null) {
                childToProcess = child[0] as IndexableElement;
                 isComplex = Object.keys(childToProcess).some(k => k !== '_attributes' && k !== '_text' && k !== '_cdata');
            }
        } else if (typeof child === 'object' && child !== null) {
            childToProcess = child as IndexableElement;
             isComplex = Object.keys(childToProcess).some(k => k !== '_attributes' && k !== '_text' && k !== '_cdata');
        }

        if (isComplex && childToProcess) {
           // Generate schema recursively for complex types
           // If it was an array, generate based on the first item, but keep maxOccurs="unbounded"
           const nestedSchema = generateSchema(childToProcess, key);
           // Adjust the maxOccurs in the generated schema string if needed
           if (Array.isArray(child)) {
             // A bit hacky string replace, might need more robust approach
             schema += nestedSchema.replace(/<xsd:element name="[^"]+"/, `$& minOccurs="1" maxOccurs="unbounded"`);
           } else {
             schema += nestedSchema; // minOccurs/maxOccurs are handled inside generateSchema call for single elements
           }

        } else {
           // Simple element (might have attributes/text) or array of simple types
           if (maxOccurs == "1") {
             schema += `      <xsd:element name="${key}" type="xsd:string"/>\n`; // Assume string type
           } else {
             schema += `      <xsd:element name="${key}" type="xsd:string" minOccurs="1" maxOccurs="${maxOccurs}"/>\n`; // Assume string type
           }
        }
      }


      schema += `    </xsd:sequence>\n`;

      // Add attributes directly to the complexType
      if (objAttributes) {
          for (const attr in objAttributes) {
              schema += `    <xsd:attribute name="${attr}" type="xsd:string" use="optional"/>\n`; // Assume string type and optional
          }
      }


      schema += `  </xsd:complexType>\n</xsd:element>\n`;
      return schema;
    };

    const rootElementName = Object.keys(jsObject)[0];
    if (!rootElementName) {
        throw new Error("Could not determine root element.");
    }
    const rootElement = jsObject[rootElementName] as IndexableElement; // Use the indexable type

    let finalSchema = `<?xml version="1.0" encoding="UTF-8" ?>\n<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n`;
    finalSchema += generateSchema(rootElement, rootElementName);
    finalSchema += `</xsd:schema>`;

    return finalSchema;

  } catch (error: any) {
    console.error("XML to XSD conversion error:", error);
     const message = error.message.includes("Unexpected close tag")
      ? `Invalid XML: ${error.message}. Check tag matching.`
      : `Invalid XML or structure for XSD generation: ${error.message}`;
    throw new Error(message);
  }
}
