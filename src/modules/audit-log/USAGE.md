# AuditLog Module - Usage Guide

## Overview

The AuditLog module provides comprehensive audit logging capabilities for tracking user actions across your application.

## Features

- **Automatic Logging**: Use decorators and interceptors for automatic audit logging
- **Manual Logging**: Call the service directly for custom logging
- **Rich Metadata**: Store IP address, user agent, old/new values, and changes
- **Powerful Filtering**: Filter by entity, action, date range, user, etc.
- **Pagination Support**: Built-in pagination for large audit logs

## Database Schema

The module uses the following Prisma model:

```prisma
model AuditLog {
  id                  String
  entity              String          // e.g., "Document", "User", "Role"
  entityId            String          // UUID of the affected entity
  action              AuditAction     // CREATE, UPDATE, DELETE, etc.
  changes             Json?           // JSON object of changes
  oldValues           Json?           // JSON object of old values
  newValues           Json?           // JSON object of new values
  ipAddress           String?
  userAgent           String?
  performedByUserId   String
  performedBy         User            // Relation to User model
  performedAt         DateTime
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime?
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  RESTORE
  LOGIN
  LOGOUT
  APPROVE
  REJECT
  ARCHIVE
  OTHER
}
```

## Setup

### 1. Run Prisma Migration

```bash
npx prisma migrate dev --name add_audit_log
npx prisma generate
```

### 2. Module is Already Registered

The AuditLog module is already registered in `app.ts`.

## Usage

### Method 1: Using the Interceptor (Recommended)

The easiest way to add audit logging is using the `@AuditLog` decorator with the interceptor:

#### Example 1: Document Creation

```typescript
import { UseInterceptors } from '@nestjs/common'
import { AuditLogInterceptor, AuditLog } from '@common'
import { AuditAction } from '@modules/audit-log'

@Controller('document')
@UseInterceptors(AuditLogInterceptor)
export class DocumentController {

  @Post()
  @AuditLog({
    entity: 'Document',
    action: AuditAction.CREATE,
    getEntityId: (result) => result.id,
    getNewValues: (result, req, body) => ({
      title: body.title,
      status: body.status,
      documentTypeId: body.documentTypeId,
    }),
  })
  async documentCreate(@Body() payload: DocumentCreateDto, @Req() req: any) {
    return await this.documentService.documentCreate({
      userId: req.user.userId,
      ...payload,
    })
  }
}
```

#### Example 2: Document Update

```typescript
@Patch(':id')
@AuditLog({
  entity: 'Document',
  action: AuditAction.UPDATE,
  getEntityId: (result, req) => req.params.id,
  getOldValues: async (result, req) => {
    // Fetch old values before update
    const oldDoc = await this.documentService.documentRetrieveOne({ id: req.params.id })
    return {
      title: oldDoc.title,
      status: oldDoc.status,
    }
  },
  getNewValues: (result, req, body) => ({
    title: body.title,
    status: body.status,
  }),
  getChanges: (result, req, body) => {
    // Calculate changes
    return { updatedFields: Object.keys(body) }
  },
})
async documentUpdate(
  @Param('id') id: string,
  @Body() payload: DocumentUpdateDto,
) {
  return await this.documentService.documentUpdate({ id, ...payload })
}
```

#### Example 3: Document Delete

```typescript
@Delete(':id')
@AuditLog({
  entity: 'Document',
  action: AuditAction.DELETE,
  getEntityId: (result, req) => req.params.id,
})
async documentDelete(@Param() params: DocumentDeleteDto, @Req() req: any) {
  return await this.documentService.documentDelete({
    ...params,
    userId: req.user.userId,
  })
}
```

### Method 2: Manual Logging

For more control, inject the `AuditLogService` and call it directly:

```typescript
import { AuditLogService, AuditAction } from '@modules/audit-log'

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async documentApprove(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const document = await this.prisma.document.findUnique({ where: { id } })

    // Perform the approval
    const updated = await this.prisma.document.update({
      where: { id },
      data: { status: 'APPROVED' },
    })

    // Log the action
    await this.auditLogService.logAction(
      'Document',
      id,
      AuditAction.APPROVE,
      userId,
      {
        oldValues: { status: document.status },
        newValues: { status: 'APPROVED' },
        changes: { action: 'approved' },
        ipAddress,
        userAgent,
      },
    )

    return updated
  }
}
```

### Method 3: Direct Service Call

```typescript
await this.auditLogService.auditLogCreate({
  entity: 'User',
  entityId: user.id,
  action: AuditAction.LOGIN,
  performedByUserId: user.id,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  changes: { loginTime: new Date() },
})
```

## Querying Audit Logs

### Via API Endpoints

The module provides REST endpoints:

#### Get All Audit Logs
```http
GET /v1/audit-log?pageNumber=1&pageSize=10&entity=Document&action=CREATE
```

Query parameters:
- `pageNumber` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)
- `search` (optional): Search by entity name
- `entity` (optional): Filter by entity type
- `entityId` (optional): Filter by entity ID
- `action` (optional): Filter by action type
- `performedByUserId` (optional): Filter by user
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)

#### Get Single Audit Log
```http
GET /v1/audit-log/:id
```

### Via Service

```typescript
// Get audit logs for a specific document
const logs = await this.auditLogService.auditLogRetrieveAll({
  entity: 'Document',
  entityId: documentId,
  pageNumber: 1,
  pageSize: 50,
})

// Get audit logs by user
const userLogs = await this.auditLogService.auditLogRetrieveAll({
  performedByUserId: userId,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31'),
})

// Get specific audit log entry
const log = await this.auditLogService.auditLogRetrieveOne({ id: logId })
```

## Permissions

Add these permissions to roles that should access audit logs:

```typescript
PERMISSIONS.AUDIT_LOG.LIST    // View list of audit logs
PERMISSIONS.AUDIT_LOG.READ    // View single audit log details
PERMISSIONS.AUDIT_LOG.CREATE  // Create audit log entries (usually system only)
```

## Best Practices

1. **Use Interceptors for CRUD Operations**: Automatically log all create, update, delete operations using the interceptor
2. **Log Business Actions**: Manually log important business actions (approve, reject, archive, etc.)
3. **Store Meaningful Changes**: Don't just log "updated" - log what changed
4. **Include Context**: Always capture IP address and user agent when available
5. **Don't Log Sensitive Data**: Avoid logging passwords, tokens, or PII in changes
6. **Soft Delete Only**: Never hard delete audit logs
7. **Regular Archival**: Consider archiving old audit logs to improve query performance

## Example: Complete Implementation

```typescript
// document.controller.ts
import { UseInterceptors } from '@nestjs/common'
import { AuditLogInterceptor, AuditLog } from '@common'
import { AuditAction } from '@modules/audit-log'

@Controller('document')
@UseInterceptors(AuditLogInterceptor)  // Apply to all endpoints
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @AuditLog({
    entity: 'Document',
    action: AuditAction.CREATE,
    getEntityId: (result) => result.id,
    getNewValues: (result, req, body) => ({
      title: body.title,
      status: body.status,
    }),
  })
  async create(@Body() dto: CreateDocumentDto, @Req() req: any) {
    return this.documentService.create(dto, req.user.userId)
  }

  @Patch(':id')
  @AuditLog({
    entity: 'Document',
    action: AuditAction.UPDATE,
    getEntityId: (result, req) => req.params.id,
    getChanges: (result, req, body) => body,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentService.update(id, dto)
  }

  @Delete(':id')
  @AuditLog({
    entity: 'Document',
    action: AuditAction.DELETE,
    getEntityId: (result, req) => req.params.id,
  })
  async delete(@Param('id') id: string) {
    return this.documentService.delete(id)
  }

  // Custom business action - logged manually in service
  @Post(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    return this.documentService.approve(id, req.user.userId, req.ip, req.headers['user-agent'])
  }
}

// document.service.ts
@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async approve(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } })

    const updated = await this.prisma.document.update({
      where: { id },
      data: { status: 'APPROVED' },
    })

    // Manual audit log for business action
    await this.auditLogService.logAction(
      'Document',
      id,
      AuditAction.APPROVE,
      userId,
      {
        oldValues: { status: doc.status },
        newValues: { status: 'APPROVED' },
        ipAddress,
        userAgent,
      },
    )

    return updated
  }
}
```

## Troubleshooting

### Audit logs not being created
- Ensure `AuditLogInterceptor` is applied to the controller
- Check that `@AuditLog` decorator is present on the endpoint
- Verify user is authenticated (req.user.userId exists)

### Missing IP address or user agent
- Ensure you're passing `@Req() req` to your controller methods
- Check that your auth guard is setting these values

### Performance issues
- Add indexes on frequently queried fields (entity, entityId, performedByUserId, performedAt)
- Implement pagination when querying large datasets
- Consider archiving old audit logs

## Future Enhancements

- [ ] Add bulk export functionality (CSV, JSON)
- [ ] Implement audit log retention policies
- [ ] Add real-time audit log streaming via WebSockets
- [ ] Create audit log dashboard with charts and analytics
- [ ] Add diff visualization for changes
