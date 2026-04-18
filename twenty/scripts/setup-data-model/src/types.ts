/**
 * Type definitions for Flent's Twenty CRM data model setup.
 * Covers metadata API interactions: objects, fields, relations.
 */

export type FieldType =
  | "TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "DATE_TIME"
  | "SELECT"
  | "MULTI_SELECT"
  | "CURRENCY"
  | "LINKS"
  | "RICH_TEXT"
  | "RATING"
  | "ADDRESS"
  | "PHONES"
  | "EMAILS"
  | "RELATION";

export type RelationType = "MANY_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY" | "ONE_TO_ONE";

export type SelectColor =
  | "green"
  | "blue"
  | "yellow"
  | "gray"
  | "red"
  | "orange"
  | "purple"
  | "turquoise"
  | "pink"
  | "sky"
  | "lime";

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  color: SelectColor;
  position: number;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  icon?: string;
  description?: string;
  options?: SelectOption[];
  defaultValue?: unknown;
  isRequired?: boolean;
}

export interface ObjectDefinition {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon: string;
  description?: string;
  fields: FieldDefinition[];
}

export interface RelationDefinition {
  fromObjectName: string;
  toObjectName: string;
  fromName: string;
  toName: string;
  fromLabel: string;
  toLabel: string;
  relationType: RelationType;
  fromIcon?: string;
  toIcon?: string;
}

export interface ExtensionDefinition {
  objectId: string;
  objectName: string;
  fields: FieldDefinition[];
}

export interface CreateObjectResponse {
  id: string;
  nameSingular: string;
  isCustom: boolean;
}

export interface CreateFieldResponse {
  id: string;
  name: string;
  type: string;
}

export interface CreateRelationResponse {
  id: string;
}

export interface ObjectMetadata {
  id: string;
  nameSingular: string;
  isCustom: boolean;
  fields: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        type: string;
        isCustom: boolean;
      };
    }>;
  };
}

export interface SetupResult {
  objectsCreated: string[];
  fieldsCreated: number;
  relationsCreated: number;
  errors: Array<{ context: string; message: string }>;
}
