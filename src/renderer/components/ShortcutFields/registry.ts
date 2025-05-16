/**
 * Registry for Shortcut field definitions
 */
import { FieldDefinition } from './types';

/**
 * Registry class for managing field definitions
 */
class FieldRegistry {
  private fields = new Map<string, FieldDefinition<any, any>>();

  /**
   * Register a field definition
   */
  register<T, D = void>(field: FieldDefinition<T, D>): void {
    if (this.fields.has(field.id)) {
      console.warn(`Field with ID ${field.id} is already registered. Overwriting.`);
    }
    this.fields.set(field.id, field);
  }

  /**
   * Get a field definition by ID
   */
  get<T, D = void>(id: string): FieldDefinition<T, D> | undefined {
    return this.fields.get(id) as FieldDefinition<T, D> | undefined;
  }

  /**
   * Get all fields that depend on the given field ID
   */
  getDependentFields<T, D = void>(parentId: string): FieldDefinition<T, D>[] {
    const dependents: FieldDefinition<T, D>[] = [];
    this.fields.forEach(field => {
      if (field.dependsOn === parentId) {
        dependents.push(field as FieldDefinition<T, D>);
      }
    });
    return dependents;
  }

  /**
   * Get all registered fields
   */
  getAllFields(): FieldDefinition<any, any>[] {
    return Array.from(this.fields.values());
  }
}

// Create and export a singleton instance
export const fieldRegistry = new FieldRegistry();

/**
 * Helper function to register multiple fields at once
 */
export function registerFields(fields: FieldDefinition<any, any>[]): void {
  fields.forEach(field => fieldRegistry.register(field));
}
