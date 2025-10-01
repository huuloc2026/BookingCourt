import { PaginationDto } from "../pagination/pagination.dto";


export interface ICrudService<TEntity, TCreateDto, TUpdateDto> {
  findAll(paginationDto: PaginationDto): Promise<{ data: TEntity[]; total: number; page: number; lastPage: number }>;
  findOne(where: { id: string }): Promise<TEntity | null>;
  create(data: TCreateDto): Promise<TEntity>;
  update(where: { id: string }, data: TUpdateDto): Promise<TEntity>;
  remove(where: { id: string }): Promise<TEntity>;
}