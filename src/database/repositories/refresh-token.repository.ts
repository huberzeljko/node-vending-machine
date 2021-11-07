import { EntityRepository, Repository } from 'typeorm';
import { RefreshTokenEntity } from '../entities';

@EntityRepository(RefreshTokenEntity)
export class RefreshTokenRepository extends Repository<RefreshTokenEntity> {}
