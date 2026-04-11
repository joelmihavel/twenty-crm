"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload01,
  File06,
  ArrowRight,
  RefreshCw01,
} from "@untitledui/icons";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { useCreateRecord } from "@/lib/hooks/use-create-record";
import { getVisibleFields } from "@/lib/twenty/query-builder";
import { FIELD_TYPE_REGISTRY } from "@/lib/twenty/field-type-registry";
import type { ObjectMetadata, FieldMetadata } from "@/lib/twenty/types";
import { parseCsv, readFileAsText } from "@/lib/csv-parser";
import type { CsvParseResult } from "@/lib/csv-parser";
import { Select } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Breadcrumbs } from "@/components/views/breadcrumbs";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

type ImportStep = "select-object" | "upload-csv" | "map-columns" | "importing" | "results";

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

// Column mapping: CSV header -> field name
type ColumnMapping = Record<string, string>;

// Step indicator component
function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step} className="flex items-center gap-1 sm:gap-2">
            <div
              className={cx(
                "flex size-6 sm:size-8 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition duration-100 ease-linear",
                isCompleted && "bg-brand-solid text-fg-white",
                isCurrent && "bg-brand-secondary text-brand-secondary ring-2 ring-brand",
                !isCompleted && !isCurrent && "bg-secondary text-quaternary",
              )}
            >
              {isCompleted ? <Check className="size-3 sm:size-4" /> : index + 1}
            </div>
            <span
              className={cx(
                "hidden text-xs font-medium sm:block",
                isCurrent ? "text-brand-secondary" : isCompleted ? "text-secondary" : "text-quaternary",
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <ArrowRight className="size-3 text-quaternary sm:size-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Step 1: Select Object
function SelectObjectStep({
  objects,
  selectedObject,
  onSelect,
}: {
  objects: ObjectMetadata[];
  selectedObject: ObjectMetadata | null;
  onSelect: (object: ObjectMetadata) => void;
}) {
  const items = objects.map((obj) => ({
    id: obj.nameSingular,
    label: obj.labelPlural,
    supportingText: `${obj.fields.length} fields`,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-primary">Select Object</h2>
        <p className="text-sm text-tertiary">
          Choose which object type you want to import data into.
        </p>
      </div>

      <Select
        label="Import into"
        placeholder="Select an object..."
        selectedKey={selectedObject?.nameSingular ?? null}
        onSelectionChange={(key) => {
          const obj = objects.find((o) => o.nameSingular === key);
          if (obj) onSelect(obj);
        }}
        items={items}
        size="md"
      >
        {(item) => (
          <Select.Item id={item.id} supportingText={item.supportingText}>
            {item.label}
          </Select.Item>
        )}
      </Select>

      {selectedObject && (
        <div className="rounded-lg border border-secondary p-4">
          <h3 className="text-sm font-medium text-secondary">
            {selectedObject.labelPlural}
          </h3>
          <p className="mt-1 text-xs text-tertiary">
            Available fields:{" "}
            {getVisibleFields(selectedObject)
              .filter((f) => FIELD_TYPE_REGISTRY[f.type]?.inlineEditable)
              .map((f) => f.label)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

// Step 2: Upload CSV
function UploadCsvStep({
  csvData,
  onFileUploaded,
  parseErrors,
}: {
  csvData: CsvParseResult | null;
  onFileUploaded: (data: CsvParseResult) => void;
  parseErrors: string[];
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDropFiles = useCallback(
    async (files: FileList) => {
      const file = files[0];
      if (!file) return;

      setFileName(file.name);
      setIsLoading(true);

      try {
        const text = await readFileAsText(file);
        const result = parseCsv(text);
        onFileUploaded(result);
      } catch {
        onFileUploaded({
          headers: [],
          rows: [],
          errors: ["Failed to read the file. Please try again."],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [onFileUploaded],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-primary">Upload CSV</h2>
        <p className="text-sm text-tertiary">
          Upload a CSV file with data to import. The first row should contain column headers.
        </p>
      </div>

      <FileUpload.Root>
        <FileUpload.DropZone
          hint="CSV files only (max. 10MB)"
          accept=".csv,text/csv"
          allowsMultiple={false}
          maxSize={10 * 1024 * 1024}
          onDropFiles={handleDropFiles}
        />
      </FileUpload.Root>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <LoadingIndicator size="sm" label="Parsing CSV..." />
        </div>
      )}

      {csvData && !isLoading && (
        <div className="rounded-lg border border-secondary p-4">
          <div className="flex items-center gap-2">
            <File06 className="size-5 text-fg-brand-primary" />
            <div>
              <p className="text-sm font-medium text-secondary">{fileName}</p>
              <p className="text-xs text-tertiary">
                {csvData.headers.length} columns, {csvData.rows.length} rows
              </p>
            </div>
          </div>

          {/* Preview first 3 headers */}
          {csvData.headers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {csvData.headers.slice(0, 6).map((header) => (
                <Badge key={header} size="sm" type="modern" color="gray">
                  {header}
                </Badge>
              ))}
              {csvData.headers.length > 6 && (
                <Badge size="sm" type="modern" color="gray">
                  +{csvData.headers.length - 6} more
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {parseErrors.length > 0 && (
        <div className="rounded-lg border border-error bg-error-primary/5 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 text-fg-error-primary" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-error-primary">Parse warnings</p>
              {parseErrors.slice(0, 5).map((error, i) => (
                <p key={i} className="text-xs text-error-primary">{error}</p>
              ))}
              {parseErrors.length > 5 && (
                <p className="text-xs text-tertiary">
                  ...and {parseErrors.length - 5} more warnings
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 3: Map Columns
function MapColumnsStep({
  csvHeaders,
  targetFields,
  mapping,
  onMappingChange,
}: {
  csvHeaders: string[];
  targetFields: FieldMetadata[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
}) {
  const fieldItems = useMemo(() => {
    return [
      { id: "__skip__", label: "(Skip this column)" },
      ...targetFields.map((f) => ({
        id: f.name,
        label: f.label,
        supportingText: FIELD_TYPE_REGISTRY[f.type]?.label,
      })),
    ];
  }, [targetFields]);

  const handleFieldChange = useCallback(
    (csvHeader: string, fieldName: string | number) => {
      onMappingChange({
        ...mapping,
        [csvHeader]: String(fieldName),
      });
    },
    [mapping, onMappingChange],
  );

  const mappedCount = Object.values(mapping).filter(
    (v) => v && v !== "__skip__",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-primary">Map Columns</h2>
        <p className="text-sm text-tertiary">
          Map each CSV column to a field in the target object.{" "}
          <span className="font-medium text-secondary">
            {mappedCount} of {csvHeaders.length} columns mapped.
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {csvHeaders.map((header) => (
          <div
            key={header}
            className="flex flex-col gap-2 rounded-lg border border-secondary p-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary truncate">
                {header}
              </p>
              <p className="text-xs text-quaternary">CSV column</p>
            </div>
            <ArrowRight className="hidden size-4 text-quaternary sm:block" />
            <div className="flex-1 min-w-0">
              <Select
                placeholder="Select field..."
                selectedKey={mapping[header] ?? null}
                onSelectionChange={(key) => { if (key !== null) handleFieldChange(header, key); }}
                items={fieldItems}
                size="sm"
              >
                {(item) => (
                  <Select.Item
                    id={item.id}
                    supportingText={item.supportingText}
                  >
                    {item.label}
                  </Select.Item>
                )}
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 4: Importing
function ImportingStep({
  progress,
  total,
  current,
}: {
  progress: number;
  total: number;
  current: number;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <Upload01 className="size-12 text-fg-brand-primary" />

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-semibold text-primary">Importing Records</h2>
        <p className="text-sm text-tertiary">
          Processing {current} of {total} records...
        </p>
      </div>

      <div className="w-full max-w-md">
        <ProgressBar
          value={progress}
          min={0}
          max={100}
          labelPosition="right"
        />
      </div>

      <p className="text-xs text-quaternary">
        Please do not close this page while the import is in progress.
      </p>
    </div>
  );
}

// Step 5: Results
function ResultsStep({
  result,
  objectLabel,
  onReset,
}: {
  result: ImportResult;
  objectLabel: string;
  onReset: () => void;
}) {
  const hasErrors = result.failed > 0;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {hasErrors ? (
        <AlertTriangle className="size-12 text-fg-warning-primary" />
      ) : (
        <CheckCircle className="size-12 text-fg-success-primary" />
      )}

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-semibold text-primary">
          Import {hasErrors ? "Completed with Errors" : "Successful"}
        </h2>
        <p className="text-sm text-tertiary">
          {result.success} {objectLabel.toLowerCase()} imported successfully.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col items-center rounded-lg border border-secondary p-4 min-w-[100px]">
          <p className="text-2xl font-semibold text-primary">{result.total}</p>
          <p className="text-xs text-tertiary">Total</p>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-secondary bg-success-primary/5 p-4 min-w-[100px]">
          <p className="text-2xl font-semibold text-success-primary">{result.success}</p>
          <p className="text-xs text-tertiary">Success</p>
        </div>
        {result.failed > 0 && (
          <div className="flex flex-col items-center rounded-lg border border-error bg-error-primary/5 p-4 min-w-[100px]">
            <p className="text-2xl font-semibold text-error-primary">{result.failed}</p>
            <p className="text-xs text-tertiary">Failed</p>
          </div>
        )}
      </div>

      {result.errors.length > 0 && (
        <div className="w-full max-w-lg rounded-lg border border-error bg-error-primary/5 p-4">
          <h3 className="mb-2 text-sm font-medium text-error-primary">Errors</h3>
          <div className="max-h-40 overflow-y-auto">
            {result.errors.slice(0, 20).map((error, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <XCircle className="mt-0.5 size-3 shrink-0 text-fg-error-secondary" />
                <p className="text-xs text-error-primary">{error}</p>
              </div>
            ))}
            {result.errors.length > 20 && (
              <p className="mt-2 text-xs text-quaternary">
                ...and {result.errors.length - 20} more errors
              </p>
            )}
          </div>
        </div>
      )}

      <Button
        size="md"
        color="primary"
        iconLeading={RefreshCw01}
        onClick={onReset}
      >
        Start New Import
      </Button>
    </div>
  );
}

export default function ImportPage() {
  const { objects, loading: metaLoading, getNavigableObjects } = useMetadata();

  const navigableObjects = useMemo(() => getNavigableObjects(), [getNavigableObjects]);

  const [step, setStep] = useState<ImportStep>("select-object");
  const [selectedObject, setSelectedObject] = useState<ObjectMetadata | null>(null);
  const [csvData, setCsvData] = useState<CsvParseResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [importProgress, setImportProgress] = useState(0);
  const [importCurrent, setImportCurrent] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const { createRecord } = useCreateRecord(selectedObject);

  const targetFields = useMemo(() => {
    if (!selectedObject) return [];
    return getVisibleFields(selectedObject).filter(
      (f) => FIELD_TYPE_REGISTRY[f.type]?.inlineEditable,
    );
  }, [selectedObject]);

  // Auto-map columns based on header name matching
  const autoMapColumns = useCallback(
    (headers: string[]) => {
      const mapping: ColumnMapping = {};
      for (const header of headers) {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matchedField = targetFields.find((f) => {
          const normalizedFieldName = f.name.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normalizedFieldLabel = f.label.toLowerCase().replace(/[^a-z0-9]/g, "");
          return (
            normalizedFieldName === normalizedHeader ||
            normalizedFieldLabel === normalizedHeader
          );
        });
        if (matchedField) {
          mapping[header] = matchedField.name;
        }
      }
      return mapping;
    },
    [targetFields],
  );

  const handleFileUploaded = useCallback(
    (data: CsvParseResult) => {
      setCsvData(data);
      // Auto-map on upload
      if (data.headers.length > 0) {
        const autoMapped = autoMapColumns(data.headers);
        setColumnMapping(autoMapped);
      }
    },
    [autoMapColumns],
  );

  // Build record data from a CSV row using the column mapping
  const buildRecordFromRow = useCallback(
    (row: Record<string, string>): Record<string, unknown> => {
      const record: Record<string, unknown> = {};
      for (const [csvHeader, fieldName] of Object.entries(columnMapping)) {
        if (fieldName === "__skip__" || !fieldName) continue;

        const rawValue = row[csvHeader];
        if (rawValue === undefined || rawValue === "") continue;

        const field = targetFields.find((f) => f.name === fieldName);
        if (!field) continue;

        // Type-coerce based on field type
        switch (field.type) {
          case "NUMBER":
          case "NUMERIC": {
            const num = Number(rawValue);
            if (!isNaN(num)) record[fieldName] = num;
            break;
          }
          case "BOOLEAN":
            record[fieldName] = rawValue.toLowerCase() === "true" || rawValue === "1";
            break;
          case "CURRENCY": {
            const amount = Number(rawValue);
            if (!isNaN(amount)) {
              record[fieldName] = {
                amountMicros: Math.round(amount * 1_000_000),
                currencyCode: "INR",
              };
            }
            break;
          }
          case "FULL_NAME": {
            const parts = rawValue.split(" ");
            record[fieldName] = {
              firstName: parts[0] || "",
              lastName: parts.slice(1).join(" ") || "",
            };
            break;
          }
          case "EMAILS":
            record[fieldName] = { primaryEmail: rawValue };
            break;
          case "PHONES":
            record[fieldName] = { primaryPhoneNumber: rawValue };
            break;
          default:
            record[fieldName] = rawValue;
        }
      }
      return record;
    },
    [columnMapping, targetFields],
  );

  const handleStartImport = useCallback(async () => {
    if (!csvData || !selectedObject) return;

    setStep("importing");
    setImportProgress(0);
    setImportCurrent(0);

    const total = csvData.rows.length;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < total; i++) {
      const row = csvData.rows[i];
      const recordData = buildRecordFromRow(row);

      try {
        const id = await createRecord(recordData);
        if (id) {
          success++;
        } else {
          failed++;
          errors.push(`Row ${i + 2}: Failed to create record`);
        }
      } catch (err) {
        failed++;
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`Row ${i + 2}: ${message}`);
      }

      setImportCurrent(i + 1);
      setImportProgress(Math.round(((i + 1) / total) * 100));
    }

    setImportResult({ total, success, failed, errors });
    setStep("results");
  }, [csvData, selectedObject, buildRecordFromRow, createRecord]);

  const handleReset = useCallback(() => {
    setStep("select-object");
    setSelectedObject(null);
    setCsvData(null);
    setColumnMapping({});
    setImportProgress(0);
    setImportCurrent(0);
    setImportResult(null);
  }, []);

  const stepIndex = useMemo(() => {
    const stepOrder: ImportStep[] = ["select-object", "upload-csv", "map-columns", "importing", "results"];
    return stepOrder.indexOf(step);
  }, [step]);

  const canProceed = useMemo(() => {
    switch (step) {
      case "select-object":
        return !!selectedObject;
      case "upload-csv":
        return !!csvData && csvData.rows.length > 0;
      case "map-columns": {
        const mappedFields = Object.values(columnMapping).filter(
          (v) => v && v !== "__skip__",
        );
        return mappedFields.length > 0;
      }
      default:
        return false;
    }
  }, [step, selectedObject, csvData, columnMapping]);

  const handleNext = useCallback(() => {
    switch (step) {
      case "select-object":
        setStep("upload-csv");
        break;
      case "upload-csv":
        setStep("map-columns");
        break;
      case "map-columns":
        handleStartImport();
        break;
    }
  }, [step, handleStartImport]);

  const handleBack = useCallback(() => {
    switch (step) {
      case "upload-csv":
        setStep("select-object");
        break;
      case "map-columns":
        setStep("upload-csv");
        break;
    }
  }, [step]);

  if (metaLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingIndicator size="lg" label="Loading metadata..." />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Breadcrumbs
        segments={[{ label: "Import" }]}
        className="border-b border-secondary"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                Import Data
              </h1>
              <p className="mt-1 text-sm text-tertiary">
                Import records from a CSV file into your workspace.
              </p>
            </div>

            {/* Step indicator */}
            <StepIndicator
              currentStep={stepIndex}
              steps={["Select", "Upload", "Map", "Import", "Done"]}
            />
          </div>

          {/* Step content */}
          <div className="rounded-xl border border-secondary p-4 sm:p-6">
            {step === "select-object" && (
              <SelectObjectStep
                objects={navigableObjects}
                selectedObject={selectedObject}
                onSelect={setSelectedObject}
              />
            )}

            {step === "upload-csv" && (
              <UploadCsvStep
                csvData={csvData}
                onFileUploaded={handleFileUploaded}
                parseErrors={csvData?.errors ?? []}
              />
            )}

            {step === "map-columns" && csvData && (
              <MapColumnsStep
                csvHeaders={csvData.headers}
                targetFields={targetFields}
                mapping={columnMapping}
                onMappingChange={setColumnMapping}
              />
            )}

            {step === "importing" && (
              <ImportingStep
                progress={importProgress}
                total={csvData?.rows.length ?? 0}
                current={importCurrent}
              />
            )}

            {step === "results" && importResult && (
              <ResultsStep
                result={importResult}
                objectLabel={selectedObject?.labelPlural ?? "records"}
                onReset={handleReset}
              />
            )}
          </div>

          {/* Navigation buttons */}
          {step !== "importing" && step !== "results" && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                size="md"
                color="secondary"
                iconLeading={ChevronLeft}
                onClick={handleBack}
                isDisabled={step === "select-object"}
              >
                Back
              </Button>
              <Button
                size="md"
                color="primary"
                iconTrailing={step === "map-columns" ? Upload01 : ChevronRight}
                onClick={handleNext}
                isDisabled={!canProceed}
              >
                {step === "map-columns" ? "Start Import" : "Continue"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
