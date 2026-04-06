/**
 * Permission Transformer Utility
 * Converts flat permission keys into a structured object for frontend consumption
 */

export interface PermissionActions {
  create?: boolean
  read?: boolean
  update?: boolean
  delete?: boolean
  approve?: boolean
  reject?: boolean
  assign?: boolean
  export?: boolean
  import?: boolean
  [key: string]: boolean | undefined
}

export interface PermissionMap {
  [resource: string]: PermissionActions
}

export interface StructuredPermissions {
  resources: PermissionMap
  raw: string[] // Keep raw keys for backward compatibility
}

export function transformPermissions(
  permissionKeys: string[],
): StructuredPermissions {
  const permissionMap: PermissionMap = {}

  permissionKeys.forEach((key) => {
    // Support both ':' and '.' as separators
    const parts = key.includes(':') ? key.split(':') : key.split('.')

    if (parts.length === 2) {
      const [resource, action] = parts
      const resourceKey = resource.toLowerCase().trim()
      const actionKey = action.toLowerCase().trim()

      // Initialize resource object if it doesn't exist
      if (!permissionMap[resourceKey]) {
        permissionMap[resourceKey] = {}
      }

      // Set the action to true
      permissionMap[resourceKey][actionKey] = true
    } else {
      // Handle legacy or non-standard permission keys
      // Treat them as standalone resource with 'access' permission
      const resourceKey = key.toLowerCase().trim()
      if (!permissionMap[resourceKey]) {
        permissionMap[resourceKey] = {}
      }
      permissionMap[resourceKey]['access'] = true
    }
  })

  return {
    resources: permissionMap,
    raw: permissionKeys,
  }
}

export function hasPermission(
  permissions: StructuredPermissions,
  resource: string,
  action: string,
): boolean {
  const resourceKey = resource.toLowerCase()
  const actionKey = action.toLowerCase()

  return permissions.resources[resourceKey]?.[actionKey] === true
}

export function hasAnyPermission(
  permissions: StructuredPermissions,
  checks: [string, string][],
): boolean {
  return checks.some(([resource, action]) =>
    hasPermission(permissions, resource, action),
  )
}

export function hasAllPermissions(
  permissions: StructuredPermissions,
  checks: [string, string][],
): boolean {
  return checks.every(([resource, action]) =>
    hasPermission(permissions, resource, action),
  )
}
