import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Provenance, Pathway, CEFRLevel } from '@educaro/shared';

@Injectable()
export class HealthService {
  constructor(private readonly dbService: DatabaseService) {}

  async getHealth() {
    const dbCheck = await this.dbService.checkConnection();

    return {
      status: 'ok',
      service: 'Educaro Applicant Journey API',
      timestamp: new Date().toISOString(),
      database: {
        status: dbCheck.connected ? 'connected' : 'disconnected',
        latencyMs: dbCheck.latencyMs,
        error: dbCheck.error,
      },
      sharedPackageLoaded: {
        provenanceLevels: Object.values(Provenance),
        pathways: Object.values(Pathway),
        cefrLevels: Object.values(CEFRLevel),
      },
    };
  }
}
