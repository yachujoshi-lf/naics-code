import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryNaicsCodeDto } from './dto/query-naics-code.dto';
import { NaicsCode } from './naics-code.entity';

@Injectable()
export class NaicsCodeService {
  constructor(
    @InjectRepository(NaicsCode)
    private readonly repo: Repository<NaicsCode>,
  ) {}

  findAll(query: QueryNaicsCodeDto): Promise<NaicsCode[]> {
    const qb = this.repo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.parent', 'parent');

    if (query.level !== undefined)
      qb.andWhere('n.level = :level', { level: query.level });
    if (query.versionYear !== undefined)
      qb.andWhere('n.version_year = :versionYear', {
        versionYear: query.versionYear,
      });
    if (query.isActive !== undefined)
      qb.andWhere('n.is_active = :isActive', { isActive: query.isActive });
    if (query.parentId !== undefined)
      qb.andWhere('n.parent_id = :parentId', { parentId: query.parentId });
    if (query.code !== undefined)
      qb.andWhere('n.code = :code', { code: query.code });

    return qb.orderBy('n.code', 'ASC').getMany();
  }

  async findOne(id: string): Promise<NaicsCode> {
    const record = await this.repo.findOne({
      where: { id },
      relations: { parent: true, children: true },
    });
    if (!record)
      throw new NotFoundException(`NAICS code with id ${id} not found`);
    return record;
  }

  async findChildren(id: string): Promise<NaicsCode[]> {
    await this.findOne(id);
    return this.repo.find({ where: { parentId: id }, order: { code: 'ASC' } });
  }
}
