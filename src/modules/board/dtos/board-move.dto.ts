import { IsUUID, IsInt, Min } from 'class-validator'

export class BoardMoveDto {
  @IsUUID()
  taskId: string

  @IsUUID()
  toBoardColumnId: string

  @IsInt()
  @Min(0)
  position: number
}
