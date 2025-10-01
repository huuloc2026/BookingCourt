// src/common/base/base.controller.ts

import { Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { PaginationDto } from '@/common/pagination/pagination.dto';
import { ICrudService } from './IBaseService';


/**
 * An abstract base controller that provides default CRUD endpoints.
 * It's generic over the Entity, Create DTO, and Update DTO.
 */
export abstract class BaseController<TEntity, TCreateDto, TUpdateDto> {
  // The service is protected and now strictly typed by our interface
  constructor(protected readonly service: ICrudService<TEntity, TCreateDto, TUpdateDto>) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    // No more `as any` needed!
    return this.service.findAll(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne({ id });
  }

  // The DTOs are now strongly typed using generics
  @Post()
  async create(@Body() createDto: TCreateDto) {
    return this.service.create(createDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: TUpdateDto) {
    return this.service.update({ id }, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove({ id });
  }
}