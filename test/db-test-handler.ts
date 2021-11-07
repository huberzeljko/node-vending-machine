import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import * as fs from 'fs';
import * as Path from 'path';

const FIXTURES_ROOT = './fixtures';

@Injectable()
export class DbTestHandler {
  constructor(private readonly connection: Connection) {}

  async closeDb() {
    if (this.connection.isConnected) {
      await this.connection.close();
    }
  }

  getOrder(entityName) {
    const order: string[] = JSON.parse(
      fs.readFileSync(
        Path.join(__dirname, FIXTURES_ROOT, '_order.json'),
        'utf8',
      ),
    );
    return order.indexOf(entityName);
  }

  async getEntities() {
    const entities = [];
    this.connection.entityMetadatas.forEach((x) =>
      entities.push({
        name: x.name,
        tableName: x.tableName,
        order: this.getOrder(x.name),
      }),
    );
    return entities;
  }

  async reloadFixtures() {
    const entities = await this.getEntities();
    await this.cleanAll(entities);
    await this.loadAll(entities);
  }

  async cleanAll(entities: any) {
    try {
      for (const entity of entities.sort((a, b) => b.order - a.order)) {
        const repository = await this.connection.getRepository(entity.name);
        await repository.query(`DELETE FROM "${entity.tableName}";`);
        // Reset IDs
        await repository.query(
          `SELECT setval('${entity.tableName}_id_seq', 1, false);`,
        );
      }
    } catch (error) {
      throw new Error(`ERROR: Cleaning test db: ${error}`);
    }
  }

  async loadAll(entities: any[]) {
    try {
      for (const entity of entities.sort((a, b) => a.order - b.order)) {
        const repository = await this.connection.getRepository(entity.name);
        const fixtureFile = Path.join(
          __dirname,
          FIXTURES_ROOT,
          `${entity.name}.json`,
        );
        if (fs.existsSync(fixtureFile)) {
          const items = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));
          await repository
            .createQueryBuilder(entity.name)
            .insert()
            .values(items)
            .execute();
        }
      }
    } catch (error) {
      throw new Error(`ERROR: Loading fixtures on test db: ${error}`);
    }
  }
}
