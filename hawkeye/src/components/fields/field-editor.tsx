"use client";

import { useState, useCallback } from "react";
import type { FieldMetadata, CurrencyValue, FullNameValue, EmailsValue, PhonesValue } from "@/lib/twenty/types";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { useSearchRecords } from "@/lib/hooks/use-search-records";
import type { SearchResult } from "@/lib/hooks/use-search-records";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Toggle } from "@/components/base/toggle/toggle";
import { MultiSelect } from "@/components/base/select/multi-select";
import { TextArea } from "@/components/base/textarea/textarea";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { ComboBox } from "@/components/base/select/combobox";
import { SelectItem } from "@/components/base/select/select-item";
import { parseDate, parseAbsoluteToLocal } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import type { Selection } from "react-aria-components";
import type { FileListItemProps } from "@/components/application/file-upload/file-upload-base";
import { uploadAttachmentFile } from "@/lib/twenty/file-upload";
import type { UploadResult } from "@/lib/twenty/file-upload";

interface FieldEditorProps {
  field: FieldMetadata;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string | null;
}

// Relation field editor component
function RelationFieldEditor({
  field,
  value,
  onChange,
}: Omit<FieldEditorProps, "error">) {
  const { objects } = useMetadata();
  const [inputValue, setInputValue] = useState("");

  // Derive target object from field name convention
  // Twenty relation fields are named like "companyId", "personId", etc.
  const targetObjectName = field.name.replace(/Id$/, "").replace(/^(.+)$/, "$1");

  const { results, loading: searchLoading, search } = useSearchRecords(targetObjectName);

  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      search(newValue, objects);
    },
    [search, objects],
  );

  const items = results.map((r: SearchResult) => ({
    id: r.id,
    label: r.title,
    supportingText: r.subtitle ?? undefined,
  }));

  return (
    <div className="flex flex-col gap-1.5">
      <ComboBox
        label={field.label}
        placeholder={`Search ${field.label.toLowerCase()}...`}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        selectedKey={(value as string) ?? null}
        onSelectionChange={(key) => {
          onChange(key);
          const selected = results.find((r: SearchResult) => r.id === key);
          if (selected) {
            setInputValue(selected.title);
          }
        }}
        items={items}
        shortcut={false}
        size="sm"
      >
        {(item) => (
          <SelectItem
            id={item.id}
            label={item.label}
            supportingText={item.supportingText}
          />
        )}
      </ComboBox>
      {searchLoading && (
        <p className="text-xs text-tertiary">Searching...</p>
      )}
    </div>
  );
}

// File upload field editor component
interface UploadedFile {
  name: string;
  size: number;
  progress: number;
  failed?: boolean;
  type?: FileListItemProps["type"];
  /** Raw File reference for retry capability. */
  rawFile?: File;
  /** Upload result from Twenty API. */
  result?: UploadResult;
}

function FilesFieldEditor({ field, onChange }: Omit<FieldEditorProps, "error">) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const getFileType = (fileName: string): FileListItemProps["type"] => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "pdf";
      case "doc":
      case "docx":
        return "doc";
      case "xls":
      case "xlsx":
        return "xls";
      case "ppt":
      case "pptx":
        return "ppt";
      case "csv":
        return "csv";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
      case "webp":
        return "img";
      case "mp4":
      case "mov":
      case "avi":
        return "vid";
      case "zip":
      case "rar":
        return "zip";
      default:
        return "empty";
    }
  };

  /** Upload a single file to Twenty and update state at the given index. */
  const uploadSingleFile = useCallback(
    async (file: File, index: number) => {
      // Set progress to in-flight
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, progress: 50, failed: false } : f,
        ),
      );

      try {
        const result = await uploadAttachmentFile(file, field.id);

        setFiles((prev) => {
          const updated = prev.map((f, i) =>
            i === index
              ? { ...f, progress: 100, failed: false, result }
              : f,
          );
          // Notify parent with all successful upload results
          const uploadedResults = updated
            .filter((f) => f.result)
            .map((f) => f.result);
          onChange(uploadedResults);
          return updated;
        });
      } catch {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, progress: 0, failed: true } : f,
          ),
        );
      }
    },
    [field.id, onChange],
  );

  const handleDropFiles = useCallback(
    (fileList: FileList) => {
      const rawFiles = Array.from(fileList);
      const newEntries: UploadedFile[] = rawFiles.map((file) => ({
        name: file.name,
        size: file.size,
        progress: 0,
        type: getFileType(file.name),
        rawFile: file,
      }));

      setFiles((prev) => {
        const startIndex = prev.length;
        const merged = [...prev, ...newEntries];

        // Kick off uploads for each new file
        rawFiles.forEach((rawFile, i) => {
          uploadSingleFile(rawFile, startIndex + i);
        });

        return merged;
      });
    },
    [uploadSingleFile],
  );

  const handleDeleteFile = useCallback(
    (index: number) => {
      setFiles((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        const uploadedResults = updated
          .filter((f) => f.result)
          .map((f) => f.result);
        onChange(uploadedResults.length > 0 ? uploadedResults : null);
        return updated;
      });
    },
    [onChange],
  );

  const handleRetry = useCallback(
    (index: number) => {
      const entry = files[index];
      if (entry?.rawFile) {
        uploadSingleFile(entry.rawFile, index);
      }
    },
    [files, uploadSingleFile],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-secondary">{field.label}</span>
      <FileUpload.Root>
        <FileUpload.DropZone
          hint="Upload files (max. 10MB each)"
          accept="*/*"
          maxSize={10 * 1024 * 1024}
          onDropFiles={handleDropFiles}
        />
        {files.length > 0 && (
          <FileUpload.List>
            {files.map((file, index) => (
              <FileUpload.ListItemProgressBar
                key={`${file.name}-${index}`}
                name={file.name}
                size={file.size}
                progress={file.progress}
                failed={file.failed}
                type={file.type}
                onDelete={() => handleDeleteFile(index)}
                onRetry={() => handleRetry(index)}
              />
            ))}
          </FileUpload.List>
        )}
      </FileUpload.Root>
    </div>
  );
}

export function FieldEditor({ field, value, onChange, error }: FieldEditorProps) {
  const isInvalid = !!error;

  switch (field.type) {
    case "TEXT":
      return (
        <Input
          label={field.label}
          value={(value as string) ?? ""}
          onChange={(v) => onChange(v)}
          isInvalid={isInvalid}
          hint={error ?? undefined}
        />
      );

    case "NUMBER":
    case "NUMERIC":
      return (
        <Input
          label={field.label}
          type="number"
          value={value != null ? String(value) : ""}
          onChange={(v) => onChange(v ? Number(v) : null)}
          isInvalid={isInvalid}
          hint={error ?? undefined}
        />
      );

    case "BOOLEAN":
      return (
        <Toggle
          isSelected={Boolean(value)}
          onChange={(checked) => onChange(checked)}
          label={field.label}
          size="sm"
        />
      );

    case "DATE":
    case "DATE_TIME": {
      const parseDateValue = (raw: unknown): DateValue | undefined => {
        if (!raw || typeof raw !== "string") return undefined;
        try {
          if (field.type === "DATE") {
            return parseDate(raw.slice(0, 10));
          }
          return parseAbsoluteToLocal(raw);
        } catch {
          return undefined;
        }
      };

      const handleDateChange = (dateValue: DateValue | null) => {
        if (!dateValue) {
          onChange(null);
          return;
        }
        onChange(dateValue.toString());
      };

      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-secondary">{field.label}</span>
          <DatePicker
            value={parseDateValue(value)}
            onChange={handleDateChange}
            onApply={() => {}}
            size="sm"
          />
          {error && (
            <p className="text-xs text-error-primary">{error}</p>
          )}
        </div>
      );
    }

    case "CURRENCY": {
      const cv = value as CurrencyValue | null;
      return (
        <Input
          label={field.label}
          type="number"
          value={cv?.amountMicros ? String(cv.amountMicros / 1_000_000) : ""}
          onChange={(v) => {
            const num = Number(v);
            // Preserve existing currencyCode instead of hardcoding INR (Fix 19)
            const existingCode = cv?.currencyCode ?? "USD";
            onChange(v ? { amountMicros: Math.round(num * 1_000_000), currencyCode: existingCode } : null);
          }}
          isInvalid={isInvalid}
          hint={error ?? undefined}
        />
      );
    }

    case "SELECT":
      return (
        <div className="flex flex-col gap-1.5">
          <Select
            label={field.label}
            selectedKey={(value as string) ?? null}
            onSelectionChange={(key) => onChange(key)}
            isInvalid={isInvalid}
          >
            {(field.options ?? []).map((opt) => (
              <Select.Item key={opt.value} id={opt.value}>{opt.label}</Select.Item>
            ))}
          </Select>
          {error && (
            <p className="text-xs text-error-primary">{error}</p>
          )}
        </div>
      );

    case "MULTI_SELECT": {
      const selectedValues = Array.isArray(value) ? value as string[] : [];
      const selectedKeySet: Selection = new Set(selectedValues);

      const options = (field.options ?? []).map((opt) => ({
        id: opt.value,
        label: opt.label,
      }));

      const handleSelectionChange = (keys: Selection) => {
        if (keys === "all") {
          onChange(options.map((o) => o.id));
        } else {
          onChange(Array.from(keys as Set<string>));
        }
      };

      return (
        <MultiSelect
          label={field.label}
          items={options}
          selectedKeys={selectedKeySet}
          onSelectionChange={handleSelectionChange}
          showFooter={false}
          size="sm"
        >
          {(item) => (
            <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>
          )}
        </MultiSelect>
      );
    }

    case "FULL_NAME": {
      const fn = (value as FullNameValue) ?? { firstName: "", lastName: "" };
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <Input
              label="First Name"
              value={fn.firstName ?? ""}
              onChange={(v) => onChange({ ...fn, firstName: v })}
              isInvalid={isInvalid}
            />
            <Input
              label="Last Name"
              value={fn.lastName ?? ""}
              onChange={(v) => onChange({ ...fn, lastName: v })}
              isInvalid={isInvalid}
            />
          </div>
          {error && (
            <p className="text-xs text-error-primary">{error}</p>
          )}
        </div>
      );
    }

    case "EMAILS": {
      const em = (value as EmailsValue) ?? { primaryEmail: "" };
      return (
        <Input
          label={field.label}
          type="email"
          value={em.primaryEmail ?? ""}
          onChange={(v) => onChange({ primaryEmail: v })}
          isInvalid={isInvalid}
          hint={error ?? undefined}
        />
      );
    }

    case "PHONES": {
      const ph = (value as PhonesValue) ?? { primaryPhoneNumber: "" };
      return (
        <Input
          label={field.label}
          type="tel"
          value={ph.primaryPhoneNumber ?? ""}
          onChange={(v) => onChange({ primaryPhoneNumber: v })}
          isInvalid={isInvalid}
          hint={error ?? undefined}
        />
      );
    }

    case "RICH_TEXT":
      return (
        <TextArea
          label={field.label}
          value={(value as string) ?? ""}
          onChange={(v) => onChange(v)}
        />
      );

    case "RATING":
      return (
        <Input
          label={field.label}
          type="number"
          value={value != null ? String(value) : ""}
          onChange={(v) => onChange(v ? Number(v) : null)}
          isInvalid={isInvalid}
          hint={error ?? undefined}
        />
      );

    case "RELATION":
      return (
        <RelationFieldEditor
          field={field}
          value={value}
          onChange={onChange}
        />
      );

    case "FILES":
      return (
        <FilesFieldEditor
          field={field}
          value={value}
          onChange={onChange}
        />
      );

    default:
      return (
        <Input
          label={field.label}
          value={value != null ? String(value) : ""}
          onChange={(v) => onChange(v || null)}
          isInvalid={isInvalid}
          hint={error ?? undefined}
        />
      );
  }
}
