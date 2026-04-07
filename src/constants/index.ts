export const PERMISSIONS = {
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    LIST: 'user:list',
    ACTIVATE: 'user:activate',
    ASSIGN_ROLE: 'user:assign_role',
  },
  ROLE: {
    CREATE: 'role:create',
    READ: 'role:read',
    UPDATE: 'role:update',
    DELETE: 'role:delete',
    LIST: 'role:list',
    ASSIGN_PERMISSIONS: 'role:assign_permissions',
  },
  PERMISSION: {
    CREATE: 'permission:create',
    READ: 'permission:read',
    UPDATE: 'permission:update',
    DELETE: 'permission:delete',
    LIST: 'permission:list',
  },
  DEPARTMENT: {
    CREATE: 'department:create',
    READ: 'department:read',
    UPDATE: 'department:update',
    DELETE: 'department:delete',
    LIST: 'department:list',
    ASSIGN_DIRECTOR: 'department:assign_director',
    VIEW_HIERARCHY: 'department:view_hierarchy',
  },
  DOCUMENT: {
    CREATE: 'document:create',
    READ: 'document:read',
    UPDATE: 'document:update',
    DELETE: 'document:delete',
    LIST: 'document:list',
    APPROVE: 'document:approve',
    REJECT: 'document:reject',
    ARCHIVE: 'document:archive',
    RESTORE: 'document:restore',
    CHANGE_STATUS: 'document:change_status',
    VIEW_HISTORY: 'document:view_history',
  },
  DOCUMENT_TYPE: {
    CREATE: 'document-type:create',
    READ: 'document-type:read',
    UPDATE: 'document-type:update',
    DELETE: 'document-type:delete',
    LIST: 'document-type:list',
    ACTIVATE: 'document-type:activate',
  },
  DOCUMENT_TEMPLATE: {
    CREATE: 'document-template:create',
    READ: 'document-template:read',
    UPDATE: 'document-template:update',
    DELETE: 'document-template:delete',
    LIST: 'document-template:list',
    PUBLISH: 'document-template:publish',
    DOWNLOAD: 'document-template:download',
  },
  WORKFLOW: {
    CREATE: 'workflow:create',
    READ: 'workflow:read',
    UPDATE: 'workflow:update',
    DELETE: 'workflow:delete',
    LIST: 'workflow:list',
    ADVANCE_STEP: 'workflow:advance_step',
    REJECT_STEP: 'workflow:reject_step',
    CANCEL: 'workflow:cancel',
    PAUSE: 'workflow:pause',
    RESUME: 'workflow:resume',
  },
  WORKFLOW_TEMPLATE: {
    CREATE: 'workflow-template:create',
    READ: 'workflow-template:read',
    UPDATE: 'workflow-template:update',
    DELETE: 'workflow-template:delete',
    LIST: 'workflow-template:list',
    ACTIVATE: 'workflow-template:activate',
  },
  WORKFLOW_STEP: {
    CREATE: 'workflow-step:create',
    READ: 'workflow-step:read',
    UPDATE: 'workflow-step:update',
    DELETE: 'workflow-step:delete',
    LIST: 'workflow-step:list',
    COMPLETE: 'workflow-step:complete',
    REJECT: 'workflow-step:reject',
    ASSIGN: 'workflow-step:assign',
    REASSIGN: 'workflow-step:reassign',
  },
  JOURNAL: {
    CREATE: 'journal:create',
    READ: 'journal:read',
    UPDATE: 'journal:update',
    DELETE: 'journal:delete',
    LIST: 'journal:list',
    ASSIGN_RESPONSIBLE: 'journal:assign_responsible',
  },
  ATTACHMENT: {
    UPLOAD: 'attachment:upload',
    READ: 'attachment:read',
    DOWNLOAD: 'attachment:download',
    DELETE: 'attachment:delete',
    LIST: 'attachment:list',
  },
  PROJECT: {
    CREATE: 'project:create',
    READ: 'project:read',
    UPDATE: 'project:update',
    DELETE: 'project:delete',
    LIST: 'project:list',
    ARCHIVE: 'project:archive',
    RESTORE: 'project:restore',
    MANAGE_MEMBERS: 'project:manage_members',
    MANAGE_LABELS: 'project:manage_labels',
  },
  TASK: {
    CREATE: 'task:create',
    READ: 'task:read',
    UPDATE: 'task:update',
    DELETE: 'task:delete',
    LIST: 'task:list',
    ASSIGN: 'task:assign',
    COMPLETE: 'task:complete',
    CHANGE_STATUS: 'task:change_status',
    WATCH: 'task:watch',
    COMMENT: 'task:comment',
    TIME_TRACK: 'task:time_track',
  },
  TASK_CATEGORY: {
    CREATE: 'task-category:create',
    READ: 'task-category:read',
    UPDATE: 'task-category:update',
    DELETE: 'task-category:delete',
    LIST: 'task-category:list',
  },
  TASK_LABEL: {
    CREATE: 'task-label:create',
    READ: 'task-label:read',
    DELETE: 'task-label:delete',
    LIST: 'task-label:list',
  },
  TASK_COMMENT: {
    CREATE: 'task-comment:create',
    READ: 'task-comment:read',
    UPDATE: 'task-comment:update',
    DELETE: 'task-comment:delete',
    LIST: 'task-comment:list',
  },
  TASK_WATCHER: {
    CREATE: 'task-watcher:create',
    READ: 'task-watcher:read',
    DELETE: 'task-watcher:delete',
    LIST: 'task-watcher:list',
  },
  TASK_TIME_ENTRY: {
    CREATE: 'task-time-entry:create',
    READ: 'task-time-entry:read',
    UPDATE: 'task-time-entry:update',
    DELETE: 'task-time-entry:delete',
    LIST: 'task-time-entry:list',
  },
  TASK_CHECKLIST: {
    CREATE: 'task-checklist:create',
    READ: 'task-checklist:read',
    UPDATE: 'task-checklist:update',
    DELETE: 'task-checklist:delete',
    LIST: 'task-checklist:list',
  },
  TASK_ATTACHMENT: {
    CREATE: 'task-attachment:create',
    READ: 'task-attachment:read',
    DELETE: 'task-attachment:delete',
    LIST: 'task-attachment:list',
  },
  TASK_DEPENDENCY: {
    CREATE: 'task-dependency:create',
    READ: 'task-dependency:read',
    DELETE: 'task-dependency:delete',
    LIST: 'task-dependency:list',
  },
  TASK_ACTIVITY: {
    READ: 'task-activity:read',
    LIST: 'task-activity:list',
  },
  PROJECT_MEMBER: {
    CREATE: 'project-member:create',
    READ: 'project-member:read',
    UPDATE: 'project-member:update',
    DELETE: 'project-member:delete',
    LIST: 'project-member:list',
  },
  PROJECT_LABEL: {
    CREATE: 'project-label:create',
    READ: 'project-label:read',
    UPDATE: 'project-label:update',
    DELETE: 'project-label:delete',
    LIST: 'project-label:list',
  },
  BOARD: {
    VIEW: 'board:view',
    MOVE: 'board:move',
  },
  BOARD_COLUMN: {
    CREATE: 'board-column:create',
    READ: 'board-column:read',
    UPDATE: 'board-column:update',
    DELETE: 'board-column:delete',
    LIST: 'board-column:list',
    REORDER: 'board-column:reorder',
  },
  TASK_SCORE_CONFIG: {
    CREATE: 'task-score-config:create',
    READ: 'task-score-config:read',
    UPDATE: 'task-score-config:update',
    DELETE: 'task-score-config:delete',
    LIST: 'task-score-config:list',
  },
  KPI_REWARD_TIER: {
    CREATE: 'kpi-reward-tier:create',
    READ: 'kpi-reward-tier:read',
    UPDATE: 'kpi-reward-tier:update',
    DELETE: 'kpi-reward-tier:delete',
    LIST: 'kpi-reward-tier:list',
  },
  USER_MONTHLY_KPI: {
    READ: 'user-monthly-kpi:read',
    LIST: 'user-monthly-kpi:list',
    FINALIZE: 'user-monthly-kpi:finalize',
  },
  DEPARTMENT_MONTHLY_KPI: {
    READ: 'department-monthly-kpi:read',
    LIST: 'department-monthly-kpi:list',
  },
  KPI_REWARD: {
    READ: 'kpi-reward:read',
    LIST: 'kpi-reward:list',
    APPROVE: 'kpi-reward:approve',
    PAY: 'kpi-reward:pay',
    REJECT: 'kpi-reward:reject',
  },
  KPI_ACHIEVEMENT: {
    READ: 'kpi-achievement:read',
    LIST: 'kpi-achievement:list',
  },
  AUDIT_LOG: {
    CREATE: 'audit-log:create',
    READ: 'audit-log:read',
    LIST: 'audit-log:list',
  },
  ANALYTICS: {
    VIEW_DASHBOARD: 'analytics:view_dashboard',
    VIEW_REPORTS: 'analytics:view_reports',
    EXPORT: 'analytics:export',
  },
  NOTIFICATION: {
    READ: 'notification:read',
    MANAGE: 'notification:manage',
    SEND: 'notification:send',
  },
  SESSION: {
    READ: 'session:read',
    LIST: 'session:list',
    REVOKE: 'session:revoke',
  },
  CHAT: {
    LIST: 'chat:list',
    READ: 'chat:read',
    SEND: 'chat:send',
    CREATE_DIRECT: 'chat:create_direct',
    CREATE_GROUP: 'chat:create_group',
    MANAGE_GROUP: 'chat:manage_group',
    DELETE_ANY_MESSAGE: 'chat:delete_any_message',
    FORWARD: 'chat:forward',
    FORWARD_DOCUMENT: 'chat:forward_document',
    CALL_AUDIO: 'chat:call_audio',
    CALL_VIDEO: 'chat:call_video',
    SETTINGS: 'chat:settings',
  },
  ADMIN: {
    VIEW_DASHBOARD: 'admin:view_dashboard',
    VIEW_ANALYTICS: 'admin:view_analytics',
    VIEW_AUDIT_LOGS: 'admin:view_audit_logs',
    SYSTEM_SETTINGS: 'admin:system_settings',
    MANAGE_ALL: 'admin:manage_all',
  },
} as const

export const getAllPermissions = (): string[] => {
  const permissions: string[] = []
  Object.values(PERMISSIONS).forEach((module) => {
    Object.values(module).forEach((permission) => {
      permissions.push(permission)
    })
  })
  return permissions
}

export const permissions = PERMISSIONS

// Workflow Step Action Types
export const STEP_ACTION_TYPES = {
  APPROVAL: 'APPROVAL',
  SIGN: 'SIGN',
  REVIEW: 'REVIEW',
  ACKNOWLEDGE: 'ACKNOWLEDGE',
} as const

export type StepActionTypeValue =
  (typeof STEP_ACTION_TYPES)[keyof typeof STEP_ACTION_TYPES]

// Role Names
export const ROLE_NAMES = {
  SUPER_ADMIN: 'Super Administrator',
  ADMIN: 'Admin',
  HR_MANAGER: 'HR Menejer',
} as const

// Workflow Step Status
export const WORKFLOW_STEP_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const

export type WorkflowStepStatusValue =
  (typeof WORKFLOW_STEP_STATUS)[keyof typeof WORKFLOW_STEP_STATUS]

export type RoleNameValue = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES]

// WOPI Permission Mappings for each StepActionType
// All action types can edit XFDF/PDF annotations
export const STEP_ACTION_WOPI_PERMISSIONS = {
  APPROVAL: {
    UserCanWrite: true,
    UserCanRead: true,
    ReadOnly: false,
    WebEditingDisabled: false,
  },
  SIGN: {
    UserCanWrite: true,
    UserCanRead: true,
    ReadOnly: false,
    WebEditingDisabled: false,
  },
  REVIEW: {
    UserCanWrite: true,
    UserCanRead: true,
    ReadOnly: false,
    WebEditingDisabled: false,
  },
  ACKNOWLEDGE: {
    UserCanWrite: true,
    UserCanRead: true,
    ReadOnly: false,
    WebEditingDisabled: false,
  },
  VERIFICATION: {
    UserCanWrite: true,
    UserCanRead: true,
    ReadOnly: false,
    WebEditingDisabled: false,
  },
} as const
