import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNaicsCodeDto } from './dto/create-naics-code.dto';
import { QueryNaicsCodeDto } from './dto/query-naics-code.dto';
import { UpdateNaicsCodeDto } from './dto/update-naics-code.dto';
import { NaicsCode } from './naics-code.entity';

@Injectable()
export class NaicsCodeService {
  constructor(
    @InjectRepository(NaicsCode)
    private readonly repo: Repository<NaicsCode>,
  ) {}

  async create(dto: CreateNaicsCodeDto): Promise<NaicsCode> {
    const existing = await this.repo.findOne({
      where: { code: dto.code, versionYear: dto.versionYear },
    });
    if (existing) {
      throw new ConflictException(
        `NAICS code ${dto.code} already exists for version year ${dto.versionYear}`,
      );
    }
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findAll(query: QueryNaicsCodeDto): Promise<NaicsCode[]> {
    const qb = this.repo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.parent', 'parent');

    if (query.level !== undefined) qb.andWhere('n.level = :level', { level: query.level });
    if (query.versionYear !== undefined) qb.andWhere('n.version_year = :versionYear', { versionYear: query.versionYear });
    if (query.isActive !== undefined) qb.andWhere('n.is_active = :isActive', { isActive: query.isActive });
    if (query.parentId !== undefined) qb.andWhere('n.parent_id = :parentId', { parentId: query.parentId });
    if (query.code !== undefined) qb.andWhere('n.code = :code', { code: query.code });

    return qb.orderBy('n.code', 'ASC').getMany();
  }

  async findOne(id: string): Promise<NaicsCode> {
    const record = await this.repo.findOne({
      where: { id },
      relations: { parent: true, children: true },
    });
    if (!record) throw new NotFoundException(`NAICS code with id ${id} not found`);
    return record;
  }

  async findChildren(id: string): Promise<NaicsCode[]> {
    await this.findOne(id);
    return this.repo.find({ where: { parentId: id }, order: { code: 'ASC' } });
  }

  async update(id: string, dto: UpdateNaicsCodeDto): Promise<NaicsCode> {
    const record = await this.findOne(id);

    if (
      (dto.code !== undefined || dto.versionYear !== undefined) &&
      (dto.code ?? record.code) !== record.code ||
      (dto.versionYear ?? record.versionYear) !== record.versionYear
    ) {
      const conflict = await this.repo.findOne({
        where: {
          code: dto.code ?? record.code,
          versionYear: dto.versionYear ?? record.versionYear,
        },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `NAICS code ${dto.code ?? record.code} already exists for version year ${dto.versionYear ?? record.versionYear}`,
        );
      }
    }

    Object.assign(record, dto);
    return this.repo.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.repo.remove(record);
  }
}
