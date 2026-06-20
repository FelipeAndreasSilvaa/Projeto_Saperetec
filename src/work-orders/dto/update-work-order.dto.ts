import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

import { Priority, WorkOrderStatus } from '@prisma/client';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  resolutionNotes?: string;

  @IsOptional()
  @IsInt({
    message: 'version deve ser um número inteiro.',
  })
  @Min(1, {
    message: 'version deve ser maior que zero.',
  })
  version?: number;
}
