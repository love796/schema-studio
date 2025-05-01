
'use client';

import type { ReactElement } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileJson, FileCode, FileX } from 'lucide-react';
import { convertToJson, convertToXml, convertToXsd } from '@/lib/conversion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ConversionType = 'xmlToJson' | 'jsonToXml' | 'xmlToXsd';

export default function Home(): ReactElement {
  const [inputType, setInputType] = useState<ConversionType>('xmlToJson');
  const [inputData, setInputData] = useState<string>('');
  const [outputData, setOutputData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lineNumbers, setLineNumbers] = useState<string>('1');
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Avoid hydration issues by setting initial state after mount
  useEffect(() => {
    setInputType('xmlToJson');
  }, []);

  useEffect(() => {
    // Ensure at least one line number is always shown
    const lines = Math.max(1, inputData.split('\n').length);
    const numbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    setLineNumbers(numbers);
  }, [inputData]);


  const handleConvert = () => {
    setIsLoading(true);
    setOutputData(''); // Clear previous output

    try {
      let result: string | null = null;
      if (inputType === 'xmlToJson') {
        result = convertToJson(inputData);
      } else if (inputType === 'jsonToXml') {
        result = convertToXml(inputData);
      } else if (inputType === 'xmlToXsd') {
        result = convertToXsd(inputData);
        if (result) {
           toast({
            title: "XML to XSD (Basic)",
            description: "Generated a basic XSD structure. Complex XML might require more advanced tools.",
          });
        }
      }

      if (result !== null) {
        setOutputData(result);
        toast({
          title: "Conversion Successful",
          description: `Successfully converted ${inputType === 'xmlToJson' ? 'XML to JSON' : inputType === 'jsonToXml' ? 'JSON to XML' : 'XML to XSD'}.`,
        });
      } else {
         toast({
          variant: "destructive",
          title: "Conversion Failed",
          description: "Input data might be invalid or the conversion is not supported.",
        });
      }
    } catch (error: any) {
      console.error("Conversion error:", error);
      setOutputData(`Error: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Conversion Error",
        description: error.message || "An unexpected error occurred during conversion.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputData(value);
    // Sync scroll for line numbers when input changes (e.g., pasting)
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };


  const getInputLabel = (): string => {
    switch (inputType) {
      case 'xmlToJson':
      case 'xmlToXsd':
        return 'XML Input';
      case 'jsonToXml':
        return 'JSON Input';
      default:
        return 'Input';
    }
  };

    const getOutputLabel = (): string => {
    switch (inputType) {
      case 'xmlToJson':
        return 'JSON Output';
      case 'jsonToXml':
        return 'XML Output';
      case 'xmlToXsd':
        return 'XSD Output';
      default:
        return 'Output';
    }
  };


  const getInputIcon = (): ReactElement => {
     switch (inputType) {
      case 'xmlToJson':
      case 'xmlToXsd':
        return <FileCode className="h-5 w-5 mr-2" />;
      case 'jsonToXml':
        return <FileJson className="h-5 w-5 mr-2" />;
      default:
        return <FileCode className="h-5 w-5 mr-2" />;
    }
  }

    const getOutputIcon = (): ReactElement => {
     switch (inputType) {
      case 'xmlToJson':
        return <FileJson className="h-5 w-5 mr-2" />;
      case 'jsonToXml':
         return <FileCode className="h-5 w-5 mr-2" />; // Use FileCode for XML consistency
      case 'xmlToXsd':
         return <FileX className="h-5 w-5 mr-2" />; // Using FileX for XSD as a placeholder
      default:
        return <FileCode className="h-5 w-5 mr-2" />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">Schema Switcher</h1>
        <p className="text-muted-foreground mt-2">Easily convert between XML, JSON, and basic XSD formats.</p>
      </header>

      <div className="flex justify-center mb-6 space-x-2 flex-wrap gap-2">
        <Button
          variant={inputType === 'xmlToJson' ? 'default' : 'outline'}
          onClick={() => { setInputType('xmlToJson'); setInputData(''); setOutputData(''); }}
        >
          <FileCode className="h-4 w-4 mr-2" /> XML to JSON
        </Button>
        <Button
          variant={inputType === 'jsonToXml' ? 'default' : 'outline'}
          onClick={() => { setInputType('jsonToXml'); setInputData(''); setOutputData(''); }}
        >
          <FileJson className="h-4 w-4 mr-2" /> JSON to XML
        </Button>
        <Button
          variant={inputType === 'xmlToXsd' ? 'default' : 'outline'}
          onClick={() => { setInputType('xmlToXsd'); setInputData(''); setOutputData(''); }}
        >
         <FileX className="h-4 w-4 mr-2" /> XML to XSD
        </Button>
      </div>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
             {getInputIcon()}
              {getInputLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <div className="relative flex-grow">
              {/* Line numbers container */}
              <div
                ref={lineNumbersRef}
                className="absolute left-0 top-0 bottom-0 w-12 pt-2 pr-3 text-right text-muted-foreground select-none font-mono text-sm overflow-hidden bg-input border-r border-border rounded-l-md"
                aria-hidden="true"
                style={{ lineHeight: '1.5rem' }} // Matches Textarea's leading-6
              >
                {lineNumbers}
              </div>
              {/* Input Textarea */}
              <Textarea
                ref={textareaRef}
                placeholder={`Paste your ${inputType === 'xmlToJson' || inputType === 'xmlToXsd' ? 'XML' : 'JSON'} here...`}
                value={inputData}
                onChange={handleInputChange}
                onScroll={handleScroll}
                className={cn(
                    "flex-grow min-h-[300px] md:min-h-[400px] bg-input text-card-foreground font-mono text-sm resize-none pl-14 rounded-l-none border-l-0", // Increased pl for wider line numbers, removed left border/rounding
                    "leading-6" // Explicitly set line height to match line numbers div
                 )}
                aria-label={getInputLabel()}
                wrap="off" // Prevent wrapping to keep line numbers accurate
                spellCheck="false"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
             <CardTitle className="flex items-center">
                {getOutputIcon()}
                {getOutputLabel()}
             </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
             {/* Output Textarea */}
            <Textarea
              placeholder="Output will appear here..."
              value={outputData}
              readOnly
              className="flex-grow min-h-[300px] md:min-h-[400px] bg-card text-card-foreground font-mono text-sm resize-none transition-opacity duration-300"
              aria-label={getOutputLabel()}
              style={{ opacity: isLoading ? 0.5 : 1 }}
               wrap="off"
               spellCheck="false"
            />
          </CardContent>
        </Card>
      </main>

      <footer className="mt-8 text-center">
        <Button onClick={handleConvert} disabled={isLoading || !inputData} size="lg">
          {isLoading ? 'Converting...' : 'Convert'}
        </Button>
      </footer>
    </div>
  );
}
