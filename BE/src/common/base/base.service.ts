// src/common/base/base.service.ts
import { PrismaService } from '@/config/prisma.service';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '@/common/pagination/pagination.dto';
import { NotFoundException } from '@nestjs/common';

export class BaseService<
  ModelName extends keyof PrismaClient
> {
  constructor(
    protected prisma: PrismaService,
    protected model: ModelName
  ) { }

  async findAll(paginationDto: PaginationDto, args?: any) {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await Promise.all([
      (this.prisma[this.model] as any).findMany({
        skip: (page - 1) * limit,
        take: limit,
        ...args,
      }),
      (this.prisma[this.model] as any).count({ ...args }),
    ]);
    const lastPage = Math.ceil(total / limit) || 1;
    return { data, total, page, lastPage };
  }

  async findOne(where: any) {
    const exist = await (this.prisma[this.model] as any).findUnique({ where });
    if (!exist) {
      throw new NotFoundException("Not Found")
    }
    return await (this.prisma[this.model] as any).findUnique({ where });
  }

  async create(data: any) {
    return (this.prisma[this.model] as any).create({ data });
  }

  async update(where: any, data: any) {
    return (this.prisma[this.model] as any).update({ where, data });
  }

  async remove(where: any) {
    return (this.prisma[this.model] as any).delete({ where });
  }
}
