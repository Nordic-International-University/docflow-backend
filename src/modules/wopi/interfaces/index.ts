// WOPI CheckFileInfo response interface
export interface WopiCheckFileInfoResponse {
  BaseFileName: string
  Size: number
  Version: string
  OwnerId: string
  UserId: string
  UserFriendlyName: string
  UserCanWrite: boolean
  UserCanNotWriteRelative: boolean
  SupportsUpdate: boolean
  SupportsLocks: boolean
  LastModifiedTime: string
  // Additional properties for full edit support
  ReadOnly?: boolean
  UserCanRename?: boolean
  UserCanAttend?: boolean
  SupportsCoauth?: boolean
  SupportsUserInfo?: boolean
  SupportsExtendedLockLength?: boolean
  WebEditingDisabled?: boolean
  UserCanPresent?: boolean
  CloseUrl?: string
  HostEditUrl?: string
  FileExtension?: string
}

// WOPI file request interface
export interface WopiFileRequest {
  fileId: string
}

// WOPI put file request
export interface WopiPutFileRequest extends WopiFileRequest {
  content: Buffer
}

// Internal file info
export interface WopiFileInfo {
  attachmentId: string
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  userId: string
  lastModified: Date
}

// WOPI token generation request
export interface WopiTokenGenerationRequest {
  fileId: string
}

// WOPI token generation response
export interface WopiTokenGenerationResponse {
  accessToken: string
  expiresAt: Date
  wopiSrc: string
}

// WOPI token permissions
export interface WopiTokenPermissions {
  UserCanWrite: boolean
  UserCanRead: boolean
  UserCanRename?: boolean
  UserCanDelete?: boolean
}

// Validated WOPI token payload
export interface WopiTokenPayload {
  tokenId: string
  userId: string
  fileId: string
  permissions: WopiTokenPermissions
  expiresAt: Date
}
